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

### CSS classes (`addClasses`, `removeClasses`, `toggleClasses`, `hasClass`)

Each of these CSS class handling functions has two different implementations,
one using `classList` and another without for browsers that don't support it
yet. Once those browsers are not supported anymore, this alternative
implementation should be removed. Check out `addClasses` [code](https://github.com/metal/metal.js/blob/master/packages/metal-dom/src/domNamed.js#L27)
as an example.

### Moving DOM elements around (`append`, `replace`, etc)

There are also a few functions that help add and remove elements from the DOM.

`append`, for example, just adds a child at the bottom of the requested parent.
The child can be passed in [different formats](https://github.com/metal/metal.js/blob/master/packages/metal-dom/src/domNamed.js#L164),
either a DOM element, or a node list, or even an html string (in which case it's
[converted into a fragment](https://github.com/metal/metal.js/blob/master/packages/metal-dom/src/domNamed.js#L169)
before being appended).

There are also functions for
[replacing an element with another](https://github.com/metal/metal.js/blob/master/packages/metal-dom/src/domNamed.js#L570),
[removing all children nodes](https://github.com/metal/metal.js/blob/master/packages/metal-dom/src/domNamed.js#L503),
[adding an element to the body](https://github.com/metal/metal.js/blob/master/packages/metal-dom/src/domNamed.js#L284)
and others.

### Selectors (`toElement`, `match`, `closest`, `parent`, `next`)

Some of the exported functions are able to do operations according to a given
CSS selector.

`toElement`, for example, will return an element on the dom that matches the
given selector, if there is one. It uses `querySelector` in most cases, but
falls back to `getElementById` when the selector is an id, as that function is
[faster](https://jsperf.com/maira-getbyid). Check out the code [here](https://github.com/metal/metal.js/blob/master/packages/metal-dom/src/domNamed.js#L680).

Another important function is `match`, which checks if a certain element matches
the given selector. It [tries](https://github.com/metal/metal.js/blob/master/packages/metal-dom/src/domNamed.js#L382)
to use an existing browser function for this, falling back to a manual
implementation if no such function is available.

The other functions using selectors all use `match` internally, like
`closest` as you can see [here](https://github.com/metal/metal.js/blob/master/packages/metal-dom/src/domNamed.js#L152).

### DOM events (`on`, `once`, `DomEventHandle`)

### Delegated events (`delegate`, `DomDelegatedEventHandle`)

### Custom events (`registerCustomEvent`)

### Events simulation (`triggerEvent`)

### Proxy (`DomEventEmitterProxy`)

### Data storage (`domData`)

### Feature checks (`features`)

### Script evaluation (`globalEval`, `globalEvalStyles`)
