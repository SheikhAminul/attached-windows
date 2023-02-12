attached-windows<br>
[![NPM Version](https://img.shields.io/npm/v/attached-windows.svg?branch=main)](https://www.npmjs.com/package/attached-windows)
[![Publish Size](https://badgen.net/packagephobia/publish/attached-windows)](https://packagephobia.now.sh/result?p=attached-windows)
[![Downloads](https://img.shields.io/npm/dt/attached-windows)](https://www.npmjs.com/package/attached-windows)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/SheikhAminul/attached-windows/blob/main/LICENSE)
================

Use attached-windows module in your Chrome extension to attach multiple normal and/or popup windows together that behave like a single window. 


## Table of Contents

*   [Features](#features)
*   [Install](#install)
*   [Usage](#usage)
*   [API Reference](#API_Reference)
*   [License](#license)
*   [Author](#author)


## Features

*   Attaches multiple windows to each other.
*   Keeps track of the state, position, and size of each window.
*   Supports normal and popup window types.
*   Automatically updates the position and size of attached windows when one of them is resized or closed.


## Install

```plaintext
npm i attached-windows
```


## Usage

A minimal example of attaching 3 windows:

```javascript
import AttachedWindows from 'attached-windows'

const configuration = {
    container: {
        top: 0,
        left: 0,
        width: 1300,
        height: 600,
        state: 'normal'
    },
    windows: [
        {
            id: (await chrome.windows.create({ type: 'normal', url: 'https://twitter.com/' })).id,
            widthFraction: 0.5,
            isPrimary: true,
            isHidden: false,
            type: 'normal'
        },
        {
            id: (await chrome.windows.create({ type: 'normal', url: 'https://www.google.com/' })).id,
            widthFraction: 0.225,
            isPrimary: false,
            type: 'popup'
        },
        {
            id: (await chrome.windows.create({ type: 'normal', url: 'https://www.github.com/' })).id,
            widthFraction: 0.25,
            isPrimary: false,
            type: 'popup'
        }
    ]
}

AttachedWindows.initialize(configuration)
```

Terminates the AttachedWindows instance and close attached windows:
```javascript
AttachedWindows.terminate({ closeWindows: true, closePrimary: false })
```
You can specify the options `closeWindows` and `closePrimary` to control if all windows or just the primary window should be closed.


## API Reference

### Interfaces

`AttachedWindowsContainer` - An interface that represents the configuration of the attached windows container.<br>
Properties:
- `top`: number
- `left`: number
- `width`: number
- `height`: number
- `state`: 'normal' | 'minimized'

`AttachedWindowsWindow` - An interface that represents the configuration of a single window within the container.<br>
Properties:
- `id`: number
- `name`: any (optional)
- `widthFraction`: number
- `isPrimary`: boolean (optional)
- `isHidden`: boolean (optional)
- `type`: 'normal' | 'popup'
- `bounds`: `AttachedWindowsContainer`

`AttachedWindowsConfiguration` - An interface that represents the configuration for the AttachedWindows class.<br>
Properties:
- `container`: `AttachedWindowsContainer`
- `windows`: `AttachedWindowsWindow[]`

### Classes

`AttachedWindows` - The main class for managing attached windows.

Properties:
- `onRemoveAttachedWindow`: Function (optional)

Methods:
- `initialize`: A method that initializes and attaches multiple windows. The input parameter `configuration` is an object of type `AttachedWindowsConfiguration` that includes the information required to initialize the attached windows.
- `terminate`: A method that terminates the AttachedWindows instance and closes the attached windows. You can specify the options `closeWindows` and `closePrimary` to control if all windows or just the primary window should be closed.


## License

attached-windows is licensed under the [MIT license](https://github.com/SheikhAminul/attached-windows/blob/main/LICENSE).


## Author

|[![@SheikhAminul](https://avatars.githubusercontent.com/u/25372039?v=4&s=96)](https://github.com/SheikhAminul)|
|:---:|
|[@SheikhAminul](https://github.com/SheikhAminul)|