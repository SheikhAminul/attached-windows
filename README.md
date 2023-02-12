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
*   [Documentation](#documentation)
*   [License](#license)
*   [Author](#author)


## Features

*   Attach multiple normal and/or popup windows together that behave like a single window.
*   All attached windows move together at the same time if the user drags and moves one of the attached windows.
*   The height of all attached windows resizes together a on single window resize.
*   Window state ('minimized' or 'normal') updates together.


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


## Documentation


## License

attached-windows is licensed under the [MIT license](https://github.com/SheikhAminul/attached-windows/blob/main/LICENSE).


## Author

|[![@SheikhAminul](https://avatars.githubusercontent.com/u/25372039?v=4&s=96)](https://github.com/SheikhAminul)|
|:---:|
|[@SheikhAminul](https://github.com/SheikhAminul)|