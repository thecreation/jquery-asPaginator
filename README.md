# [jQuery asPaginator](https://github.com/amazingSurge/jquery-asPaginator) ![bower][bower-image] [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![prs-welcome]](#contributing)

> A jquery plugins taht help generate a paginator.

## Table of contents
- [Main files](#main-files)
- [Quick start](#quick-start)
- [Requirements](#requirements)
- [Usage](#usage)
- [Examples](#examples)
- [Options](#options)
- [Methods](#methods)
- [Events](#events)
- [No conflict](#no-conflict)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [Development](#development)
- [Changelog](#changelog)
- [Copyright and license](#copyright-and-license)

## Main files
```
dist/
├── jquery-asPaginator.js
├── jquery-asPaginator.es.js
├── jquery-asPaginator.min.js
└── css/
    ├── asPaginator.css
    └── asPaginator.min.css
```

## Quick start
Several quick start options are available:
#### Download the latest build

 * [Development](https://raw.githubusercontent.com/amazingSurge/jquery-asPaginator/master/dist/jquery-asPaginator.js) - unminified
 * [Production](https://raw.githubusercontent.com/amazingSurge/jquery-asPaginator/master/dist/jquery-asPaginator.min.js) - minified

#### Install From Bower
```sh
bower install jquery-asPaginator --save
```

#### Install From Npm
```sh
npm install jquery-asPaginator --save
```

#### Build From Source
If you want build from source:

```sh
git clone git@github.com:amazingSurge/jquery-asPaginator.git
cd jquery-asPaginator
npm install
npm install -g gulp-cli babel-cli
gulp build
```

Done!

## Requirements
`jquery-asPaginator` requires the latest version of [`jQuery`](https://jquery.com/download/).

## Usage
#### Including files:

```html
<link rel="stylesheet" href="/path/to/asPaginator.css">
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery-asPaginator.js"></script>
```

#### Required HTML structure

```html
<div class="example"></div>
```

#### Initialization
All you need to do is call the plugin inside a `$(document).ready` function:

```javascript
$(document).ready(function() {
    $('.example').asPaginator(); 
});
```

## Examples
There are some example usages that you can look at to get started. They can be found in the
[examples folder](https://github.com/amazingSurge/jquery-asPaginator/tree/master/examples).

## Options
`jquery-asPaginator` can accept an options object to alter the way it behaves. You can see the default options by call `$.asPaginator.setDefaults()`. The structure of an options object is as follows:

```
{
  namespace: 'asPaginator',

  currentPage: 1,
  itemsPerPage: 10,
  visibleNum: 5,
  resizeThrottle: 250,

  disabledClass: 'asPaginator_disable',
  activeClass: 'asPaginator_active',

  tpl() {
    return '<ul>{{first}}{{prev}}{{lists}}{{next}}{{last}}</ul>';
  },

  skin: null,
  components: {
    first: true,
    prev: true,
    next: true,
    last: true,
    lists: true
  },

  // callback function
  onInit: null,
  onReady: null,
  onChange: null // function(page) {}
}
```

## Methods
Methods are called on asPaginator instances through the asPaginator method itself.
You can also save the instances to variable for further use.

```javascript
// call directly
$().asPaginator('destory');

// or
var api = $().data('asPaginator');
api.destory();
```

#### enable()
Enable the scrollbar functions.
```javascript
$().asPaginator('enable');
```

#### disable()
Disable the scrollbar functions.
```javascript
$().asPaginator('disable');
```

#### destroy()
Destroy the scrollbar instance.
```javascript
$().asPaginator('destroy');
```

## Events
`jquery-asPaginator` provides custom events for the plugin’s unique actions. 

```javascript
$('.the-element').on('asPaginator::ready', function (e) {
  // on instance ready
});

```

Event   | Description
------- | -----------
init    | Fires when the instance is setup for the first time.
ready   | Fires when the instance is ready for API use.
enable  | Fired when the `enable` instance method has been called.
disable | Fired when the `disable` instance method has been called.
destroy | Fires when an instance is destroyed. 

## No conflict
If you have to use other plugin with the same namespace, just call the `$.asPaginator.noConflict` method to revert to it.

```html
<script src="other-plugin.js"></script>
<script src="jquery-asPaginator.js"></script>
<script>
  $.asPaginator.noConflict();
  // Code that uses other plugin's "$().asPaginator" can follow here.
</script>
```

## Browser support

Tested on all major browsers.

| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/safari/safari_32x32.png" alt="Safari"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/chrome/chrome_32x32.png" alt="Chrome"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/firefox/firefox_32x32.png" alt="Firefox"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/edge/edge_32x32.png" alt="Edge"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer/internet-explorer_32x32.png" alt="IE"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/opera/opera_32x32.png" alt="Opera"> |
|:--:|:--:|:--:|:--:|:--:|:--:|
| Latest ✓ | Latest ✓ | Latest ✓ | Latest ✓ | 9-11 ✓ | Latest ✓ |

As a jQuery plugin, you also need to see the [jQuery Browser Support](http://jquery.com/browser-support/).

## Contributing
Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md). Make sure you're using the latest version of `jquery-asPaginator` before submitting an issue. There are several ways to help out:

* [Bug reports](CONTRIBUTING.md#bug-reports)
* [Feature requests](CONTRIBUTING.md#feature-requests)
* [Pull requests](CONTRIBUTING.md#pull-requests)
* Write test cases for open bug issues
* Contribute to the documentation

## Development
`jquery-asPaginator` is built modularly and uses Gulp as a build system to build its distributable files. To install the necessary dependencies for the build system, please run:

```sh
npm install -g gulp
npm install -g babel-cli
npm install
```

Then you can generate new distributable files from the sources, using:
```
gulp build
```

More gulp tasks can be found [here](CONTRIBUTING.md#available-tasks).

## Changelog
To see the list of recent changes, see [Releases section](https://github.com/amazingSurge/jquery-asPaginator/releases).

## Copyright and license
Copyright (C) 2016 amazingSurge.

Licensed under [the LGPL license](LICENSE).

[⬆ back to top](#table-of-contents)

[bower-image]: https://img.shields.io/bower/v/jquery-asPaginator.svg?style=flat
[bower-link]: https://david-dm.org/amazingSurge/jquery-asPaginator/dev-status.svg
[npm-image]: https://badge.fury.io/js/jquery-asPaginator.svg?style=flat
[npm-url]: https://npmjs.org/package/jquery-asPaginator
[license]: https://img.shields.io/npm/l/jquery-asPaginator.svg?style=flat
[prs-welcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[daviddm-image]: https://david-dm.org/amazingSurge/jquery-asPaginator.svg?style=flat
[daviddm-url]: https://david-dm.org/amazingSurge/jquery-asPaginator