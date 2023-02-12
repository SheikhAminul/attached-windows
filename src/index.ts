export interface AttachedWindowsContainer {
    top: number,
    left: number,
    width: number,
    height: number,
    state: 'normal' | 'minimized'
}

export interface AttachedWindowsWindow {
    id: number,
    name?: any,
    widthFraction: number,
    isPrimary?: boolean,
    isHidden?: boolean,
    type: 'normal' | 'popup',
    bounds: {
        top: number,
        left: number,
        width: number,
        height: number,
        state: 'normal' | 'minimized'
    }
}

export interface AttachedWindowsConfiguration {
    container: AttachedWindowsContainer,
    windows: {
        id: number,
        name?: any,
        widthFraction: number,
        isPrimary?: boolean,
        isHidden?: boolean,
        type: 'normal' | 'popup'
    }[]
}

const minimumWidths = {
    'normal': 525,
    'popup': 200
}

const onBoundsChanged = ({ id: currentId, height, top, state, left, width }: chrome.windows.Window | any) => {
    if (AttachedWindows.isBusy) return false

    const { windows, container } = AttachedWindows
    const currentIndex = windows.findIndex(({ id }) => id === currentId)
    if (currentIndex !== -1) {
        const { bounds } = windows[currentIndex]

        // Update container
        if (state !== bounds.state) container.state = (state === 'normal' || state === 'minimized') ? state : 'normal'
        if (height !== bounds.height) container.height = height
        if (top !== bounds.top) container.top = top

        if ((left !== bounds.left) && (width === bounds.width || currentIndex === 0)) container.left += left - bounds.left

        if (width !== bounds.width) {
            // Condition: (RESIZED FROM THE LEFT SIDE OF THE FIRST WINDOW) || (RESIZED FROM THE RIGHT SIDE OF THE LAST WINDOW)
            if ((currentIndex === 0 && left !== bounds.left) || (left === bounds.left && currentIndex === windows.length - 1)) {
                windows[currentIndex].widthFraction = windows[currentIndex].widthFraction / bounds.width * width
                container.width += width - bounds.width
            } else {
                const { widthFraction: widthFractionPrevious } = windows[currentIndex]
                windows[currentIndex].widthFraction = widthFractionPrevious / bounds.width * width
                if (left === bounds.left) {
                    windows[currentIndex + 1].widthFraction += (widthFractionPrevious - windows[currentIndex].widthFraction)
                } else {
                    windows[currentIndex - 1].widthFraction += (widthFractionPrevious - windows[currentIndex].widthFraction)
                }
            }
        }

        // Apply changes
        AttachedWindows.calculateBounds()
        AttachedWindows.syncPositions()
    }
}

const onRemoved = async (closedWindowId: number) => {
    if (AttachedWindows.isBusy) return false

    const { windows } = AttachedWindows
    const currentIndex = windows.findIndex(({ id }) => id === closedWindowId)
    if (currentIndex !== -1) {
        // Terminate if primary window removed
        const window = windows[currentIndex]
        if (window.isPrimary) await AttachedWindows.terminate()
        else {
            // Remove closed window
            windows.splice(currentIndex, 1)

            // Apply changes
            AttachedWindows.calculateBounds()
            AttachedWindows.syncPositions()
        }

        // Trigger listener if available
        if (AttachedWindows.onRemoveAttachedWindow) AttachedWindows.onRemoveAttachedWindow(window)
    }
}

const onBeforeUnload = async () => {
    // Terminate on before unload
    await AttachedWindows.terminate()
}

class AttachedWindows {
    static isBusy: boolean = false
    static onRemoveAttachedWindow?: Function
    static async terminate({ closeWindows = true, closePrimary = false }: { closeWindows?: boolean, closePrimary?: boolean } = {}) {
        // Remove event listeners
        if (chrome.windows.onBoundsChanged.hasListener(onBoundsChanged)) chrome.windows.onBoundsChanged.removeListener(onBoundsChanged)
        if (chrome.windows.onRemoved.hasListener(onRemoved)) chrome.windows.onRemoved.removeListener(onRemoved)
        removeEventListener('beforeunload', onBeforeUnload, false)

        // Close windows
        let availableWindows: { id: number, isPrimary?: boolean }[] = []
        await Promise.all(
            this.windows.map(async ({ id, isPrimary }) => {
                if ((isPrimary && closePrimary) || (!isPrimary && closeWindows)) await chrome.windows.remove(id).catch(() => { })
                else availableWindows.push({ id, ...(isPrimary ? { isPrimary } : {}) })
            })
        )

        // Restore primary window if not closing
        if (!closePrimary) {
            const foundPrimaryWindow = this.windows.find(({ isPrimary }) => isPrimary)
            if (foundPrimaryWindow) {
                this.windows = [foundPrimaryWindow]
                this.calculateBounds()
                await this.syncPositions(true)
            }
        }

        // Empty windows array
        this.windows = []
        this.container = {} as any

        // Return available / not closed windows
        return availableWindows
    }
    static container: AttachedWindowsContainer = {} as any
    static windows: AttachedWindowsWindow[] = []
    static calculateBounds() {
        // Calculate window bounds
        const { container: { top, height, state, left: containerLeft, width: containerWidth }, windows } = this
        const containerWidthFraction = windows.reduce((total, { widthFraction, isHidden }) => total + (isHidden ? 0 : widthFraction), 0)
        windows.reduce(([left, availableWidth], window) => {
            if (window.isHidden) {
                window.bounds = { state: 'minimized' } as any
                return [left, availableWidth]
            } else {
                let width = Math.round(containerWidth * window.widthFraction / containerWidthFraction)
                if (width < minimumWidths[window.type]) width = minimumWidths[window.type]
                if (width > availableWidth) width = availableWidth
                window.bounds = { top, height, state, left, width: Math.round(width) }
                return [left + width, availableWidth - width]
            }
        }, [containerLeft, containerWidth])
    }
    static async syncPositions(ignoreCheck: boolean = false) {
        // Apply changes to the windows
        if (this.isBusy) return false

        this.isBusy = true
        await Promise.all(this.windows.map(
            ({ id, bounds }) => chrome.windows.update(id, bounds.state === 'minimized' ? { state: 'minimized' } : bounds).catch(() => { }).catch(() => { })
        ))
        this.isBusy = false

        // Terminate if total number of window is 0 or 1
        if (!ignoreCheck) {
            if (this.windows.length === 0) await this.terminate()
            else if (this.windows.length === 1) await this.terminate({ closePrimary: false })
        }

        // Return true if succeed
        return true
    }
    static async initialize({ container, windows }: AttachedWindowsConfiguration) {
        if (!windows.find(({ isPrimary }) => isPrimary)) throw new Error(`No primary window. 'windows' must have one primary window.`)
        if (this.windows.length) await this.terminate()

        this.container = container
        this.windows = windows as any

        this.calculateBounds()
        await this.syncPositions()

        // Add event listeners
        if (!chrome.windows.onBoundsChanged.hasListener(onBoundsChanged)) chrome.windows.onBoundsChanged.addListener(onBoundsChanged)
        if (!chrome.windows.onRemoved.hasListener(onRemoved)) chrome.windows.onRemoved.addListener(onRemoved)
        addEventListener('beforeunload', onBeforeUnload, false)
    }
}

export default AttachedWindows  