# metal-dom

The [metal-dom](https://github.com/metal/metal.js/tree/master/packages/metal-dom)
package contains several functions designed to help interact with the browser's
dom tree.

## Usage

To use it, first install **metal-dom** through npm, like this:
```sh
[sudo] npm install metal-dom
```

Then you'll be able to import its contents in your ES6 modules. For example:

```js
import {addClasses, delegate} from 'metal-dom';
```

## Exported values

At the time this document was created, **metal-dom** exported 32 variables for
the developer. If you wish, you can quickly see a list of all the current
exports by doing something like this:

```js
import * as dom from 'metal-dom';
console.log(Object.keys(dom));
```

You can also check what this module exports by looking at its entry file's code,
which is located at
[packages/metal-dom/src/all/dom.js](https://github.com/metal/metal.js/blob/master/packages/metal-dom/src/all/dom.js),
as can be seen in its [package.json](https://github.com/metal/metal.js/blob/master/packages/metal-dom/package.json#L11).

Many of the exported functions are very straightforward, doing simple dom
manipulations like [adding](https://github.com/metal/metal.js/blob/master/packages/metal-dom/src/domNamed.js#L27)/[removing css classes](https://github.com/metal/metal.js/blob/master/packages/metal-dom/src/domNamed.js#L515)
or [appending elements to a parent](https://github.com/metal/metal.js/blob/master/packages/metal-dom/src/domNamed.js#L167).
Here we'll focus on the more complex and important ones.
