# metal-incremental-dom

The [metal-incremental-dom](https://github.com/metal/metal.js/tree/master/packages/metal-incremental-dom)
package provides `IncrementalDomRenderer`, a sub class of `ComponentRenderer`
which provides support for [incremental dom](https://github.com/google/incremental-dom)
in components.

## Usage

To use it, first install **metal-incremental-dom** through npm, like this:
```sh
[sudo] npm install metal-incremental-dom
```

Then you'll be able to import its contents in your ES6 modules, like this:

```js
import IncrementalDomRenderer from 'metal-incremental-dom';
```

## Exported values

`IncrementalDomRenderer` is the only value exported from **metal-incremental-dom**.

The entry file is
[packages/metal-incremental-dom/src/IncrementalDomRenderer.js](https://github.com/metal/metal.js/blob/master/packages/metal-incremental-dom/src/IncrementalDomRenderer.js).

## incremental dom

Before diving into `IncrementalDomRenderer`'s code we need to first understand
a bit about the incremental dom api. If you want to learn all the details, I'd
suggested reading [its guide](https://google.github.io/incremental-dom/#about).
I'll just do an overview on the most important parts.

The main thing to know is that incremental dom is very similar to [virtual dom](https://medium.com/cardlife-app/what-is-virtual-dom-c0ec6d6a925c#.8un3djhzp),
which is the strategy react uses. Both were built to allow quickly updating the
DOM with new contents, while trying to reuse what's already on the screen as
much as possible, automatically. So if, for example, the difference from the old
content and the new content is just an html attribute, these algorithms will
detect it and just change that, instead of rerendering everything. The main
difference between the two is the implementation and the api. We'll see the api
here, but feel free to check out the implementation if you wish as well, it's
[open source](https://github.com/google/incremental-dom)!

Check out this [fiddle](https://jsfiddle.net/metaljs/jewp0tLo/) to use how you
can render some content using incremental dom.

```js
function render(label) {
  IncrementalDOM.elementOpen('button', null, null, 'type', 'button');
  IncrementalDOM.text(label);
  IncrementalDOM.elementClose('button');
}

// Will render <button type="button">Incremental DOM Button</button>
IncrementalDOM.patch(
  container,
  () => render('Incremental DOM Button')
);
```

As you can see the main idea is that you need to call this `patch` function
from incremental dom, passing it the element where the contents should be added
and a function that calls incremental dom to render them. Inside this function
you can use methods like `elementOpen`, `elementClose` for opening/closing html
tags. Note that attributes are passed via `elementOpen`. If there are more
attributes you can just keep passing them to it, it accepts any number of
arguments, expecting key/value pairs from the fourth parameter on.

The second argument passed to `elementOpen` is an optional key, which can be
used to help incremental dom reuse the right elements, particularly when
rendering an array of items, as explained [here](http://google.github.io/incremental-dom/#conditional-rendering/array-of-items).

The third argument is an array of key/value pairs for attributes, in the same
format as the ones passed later, but that are known to be static, so that
incremental dom can skip updating them later, and only use them when creating
new elements.The attributes passed after the fourth parameter are always
compared and updated when changed. In other words, this statics array is just
an optimization, and should only be used when the developer is sure of what
he's doing.

We'll show some more incremental dom functions as we dive into
`IncrementalDomRenderer`'s code, but this should be enough for now.

It's easy to see that this api requires a lot of boilerplate, with big function
names and having to pass attributes in a weird way. Incremental DOM isn't
supposed to be used directly though, but to be a compilation target for
templates, like [soy](https://developers.google.com/closure/templates/) and
[jsx](https://www.npmjs.com/package/babel-plugin-incremental-dom).

If you've ever used React's [virtual dom api](https://facebook.github.io/react/docs/react-without-jsx.html)
you'll notice that incremental dom is quite different. In React's virtual dom,
calls to `createElement` return an object with information about the dom
element to be created, and the actual operation is only done afterwards, when
an object like this is passed to `ReactDOM.render`. Incremental DOM works very
differently, as it doesn't build these intermediary objects, but instead does
the rendering operation as soon as the functions run. It also currently has no
concept of components, it can only handle rendering real html elements. We need
our renderer to allow using component classes as tags on their templates though,
like in jsx: `<Modal title="My Modal Title" />`. These things were the main
challenges when building `IncrementalDomRenderer`.

## IncrementalDomRenderer

## Next steps

Next we'll take a look at: **metal-soy**.

[↪ Package: metal-soy](metal-soy.md)
