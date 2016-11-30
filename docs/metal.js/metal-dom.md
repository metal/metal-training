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
[packages/metal-dom/src/all/dom.js](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/all/dom.js),
as can be seen in its [package.json](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/package.json#L11).

Many of the exported functions are very straightforward, doing simple dom
manipulations like [adding](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L27)/[removing css classes](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L515)
or [appending elements to a parent](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L167).
Here we'll focus on the more complex and important ones.

### CSS classes (`addClasses`, `removeClasses`, `toggleClasses`, `hasClass`)

Each of these CSS class handling functions has two different implementations,
one using `classList` and another without for browsers that don't support it
yet. Once those browsers are not supported anymore, this alternative
implementation should be removed. Check out `addClasses` [code](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L27)
as an example.

### Moving DOM elements around (`append`, `replace`, etc)

There are also a few functions that help add and remove elements from the DOM.

`append`, for example, just adds a child at the bottom of the requested parent.
The child can be passed in [different formats](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L164),
either a DOM element, or a node list, or even an html string (in which case it's
[converted into a fragment](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L169)
before being appended).

There are also functions for
[replacing an element with another](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L570),
[removing all children nodes](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L503),
[adding an element to the body](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L284)
and others.

### Selectors (`toElement`, `match`, `closest`, `parent`, `next`)

Some of the exported functions are able to do operations according to a given
CSS selector.

`toElement`, for example, will return an element on the dom that matches the
given selector, if there is one. It uses `querySelector` in most cases, but
falls back to `getElementById` when the selector is an id, as that function is
[faster](https://jsperf.com/maira-getbyid). Check out the code [here](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L680).

Another important function is `match`, which checks if a certain element matches
the given selector. It [tries](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L382)
to use an existing browser function for this, falling back to a manual
implementation if no such function is available.

The other functions using selectors all use `match` internally, like
`closest` as you can see [here](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L152).

### Data storage (`domData`)

`domData` was built mostly for internal usage. It provides a simple way to store
data inside DOM elements without causing conflicts with data that the element
may already be using. It has only two functions: `get` and `has`. `get` returns
an object that can receive any data that you like. That object is added to the
element when `get` is called on it for the [first time](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domData.js#L15).

`get`'s api also allows specifying a [specific property](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domData.js#L24)
to return from the data object, as well as a [default value](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domData.js#L22)
to set it to before returning.

### DOM events (`on`, `once`, `DomEventHandle`)

Through the `on` function from **metal-dom** you can subscribe to DOM events.
Check out this [fiddle](https://jsfiddle.net/metaljs/dw1648c4/) example.

```js
import { on } from 'metal-dom';
const button = document.getElementById('button');
on(button, 'click', () => alert('Clicked'));
```

This use case is just an alternative to calling `addEventListener` directly on
the element, which is exactly [what it does](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L456).

Calling `on` instead of `addEventListener` has a few advantages though. Besides
being a shorter name to type, it [returns a handle](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L457)
that can be used to quickly unsubscribe the listener later, just like the one
we've seen for [EventEmitter](https://github.com/mairatma/metal-training/blob/88a5b6779596337ecc26b9615f57b848373e730a/docs/metal.js/metal-events/EventHandle.md).
Check out this [fiddle](https://jsfiddle.net/metaljs/jx6fjm9v/) example.

```js
import { on } from 'metal-dom';
const button = document.getElementById('button');
const handle = on(button, 'click', () => alert('Never alerted'));
handle.removeListener();
```

This handle object is an instance of `DomEventHandle`, which extends
`EventHandle` from **metal-events** to change how it [removes listeners](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/DomEventHandle.js#L28),
since the DOM api is different from our `EventEmitter`'s.

There's also the option of subscribing an event only once, via the `once`
function, again similar to `EventEmitter`. Its [implementation](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L470)
just involves unsubscribing the event through its handle after the listener is
called.

Looking at the [code](https://github.com/metal/metal.js/blob/88a5b6779596337ecc26b9615f57b848373e730a/packages/metal-dom/src/domNamed.js#L447)
for `on` more closely you'll notice that it does more than what we've covered
here. We'll explain event delegation and custom events in the following sections.

### Delegated events (`delegate`, `DomDelegatedEventHandle`)

[Event delegation](https://davidwalsh.name/event-delegate) is a common technique
nowadays, encouraged by most js libraries. It can be tricky to manually handle
every time though, so **metal-dom** provides a function to do this too, called
`delegate`. It accepts delegating events to a container element by either
specifying a child selector, or a child element.

#### With child selector

Check out this [fiddle](https://jsfiddle.net/metaljs/fqmjrk7z/).

```js
import { delegate } from 'metal-dom';
const wrapper = document.getElementById('wrapper');

// Will only alert when an element with the "match" CSS class
// inside "wrapper" is clicked.
delegate(wrapper, 'click', '.match', () => alert('Clicked'));
```

*[Debug example](../../../playground/examples/metal-dom/delegate.js)*

Let's dive into this function's [code](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L230)
to see how this works now. Let's skip the custom event and default listener
logic at the top of the function for now, and go directly to the
[call](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L243)
to `attachDelegateEvent_`.

This function is the one that subscribes to the
requested event type on the given element, using the [on function](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L134)
we've seen before, passing it a listener called `handleDelegateEvent_`. Note
that it won't subscribe to the same event type on the same element more than
once, as that's unnecessary. A single listener can handle all delegated events.
Also note that this is making use of `domData` to
[store](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L131)
the delegation data, such as the event handle, inside the element.

After running `attachDelegateEvent_`, the [code](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L245)
will call `addSelectorListener_`, since a selector string was passed. That just
adds the specified listener for that selector to the [same domData object](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L105)
used by `attachDelegateEvent_`.

Finally, `delegate` also [returns a handle](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L250)
like `on`. This time it's an instance of `DomDelegatedEventHandle`, which also
extends `EventHandle`, but this time removes the listener by
[removing the selector](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/DomDelegatedEventHandle.js#L30)
from that `domData` object we've already seen.

What happens when a delegated event is triggered though? The following diagram
may help understand it.

![delegate](../../diagrams/delegate.png)

First, the event will bubble from its target. When it reaches a delegating
container, it will trigger `handleDelegateEvent_`, the listener we saw being
registered. The most important part of what that listener does happens when it
calls `triggerDelegatedListeners_` [here](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L313). That function will simulate the bubbling phase again, moving up the
DOM tree from the event's target, and [calling](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L659)
`triggerSelectorListeners_` for each element it passes through.
`triggerSelectorListeners_` is the function that will actually
[go through all registered selectors](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L828)
for the current delegating container and use the `match` function to check if
the current element should be triggered for that selector's listeners or not.
If so, the listeners are called by `triggerListeners_` [here](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L806).

This shows how important the bubbling phase is for the delegation logic to work.
Unfortunately there are a few event types that don't support bubbling, like
`focus` and `blur`. We go around these cases by subscribing to these events in
the [capture phase](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L138)
instead, guaranteeing that the delegating container will be triggered.

#### With child element

The `delegate` function also allows passing a child element directly instead of
a css selector, like on this [fiddle](https://jsfiddle.net/metaljs/0rthtwbs/).

```js
import { delegate } from 'metal-dom';
const wrapper = document.getElementById('wrapper');

// Will only alert when the second child of "wrapper" is clicked.
delegate(wrapper, 'click', wrapper.childNodes[1], () => alert('Clicked'));
```

Most of the code that makes this work has already been explained in the previous
section, as it's almost the same used by the selector delegation. Inside the
`delegate` function, the only part that is different is that
`addElementListener_` will run instead of `addSelectorListener_`, as can be
seen [here](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L247).
`addElementListener_` just [stores](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L92)
the received listener in a `domData` object of the child element.

When a delegated event is triggered the flow is much the same as well.
`triggerDelegatedListeners_` will go up the tree as before, but besides calling
`triggerSelectorListeners_` it also calls `triggerElementListeners_` [for each element](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L658)
it goes through, and that's the function that handles this use case. As you can
imagine, this function will look for listeners in the current element's
`domData` object and run them via [triggerListeners_](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L763)
like before.

The main difference in this case is that `triggerElementListeners_` does
[some checks](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L761)
before running any listeners it finds, which doesn't happen with
`triggerSelectorListeners_`. These checks are there to make sure that delegated
element listeners won't run twice if two different ancestors of a node get
triggered to handle the event. Since these listeners are stored in the actual
element both ancestors would go up the tree and find them. This doesn't happen
when using selectors because the listeners are stored with the delegating
container, and so can't be run from another. To prevent this problem we
[set a property](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L317)
to the event object with the last delegating container that handled it. This way
we can [detect that](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L761)
when running a second container.

### Default listeners

**metal-dom** also allows defining delegate listeners as default, which works
the same way as we've already seen in
[EventEmitter](metal-events/EventEmitter.md#default-listeners).

It's enabled
by passing `true` as the [fifth argument](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L230) of the `delegate` function. When this happens we
[store a property](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L237)
in the given listener to indicate that it's special, and so should run last.
When triggering listeners, `triggerListeners_` [skips](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L801)
the ones that have this property, collecting them in an array, which gets
[looped later](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L314)
in `triggerDefaultDelegatedListeners_` to run all default listeners.

### Custom events (`registerCustomEvent`)

**metal-dom** also allows the developer to register custom events based on real
dom events, like a double click event based on regular clicks. Check out this
[fiddle](https://jsfiddle.net/metaljs/zynf2y9p/).

```js
import { on, registerCustomEvent } from 'metal-dom';

let lastClick = {};
registerCustomEvent('doubleclick', {
  delegate: true,
  event: true,
  handler: (callback, event) => {
    const time = Date.now();
    if (lastClick.target === event.target && time - lastClick.time <= 500) {
      // Same target was clicked twice in a short time, trigger the custom event.
      lastClick = {};
      callback(event);
		} else {
      lastClick.target = event.target;
      lastClick.time = time;
    }
  },
  originalEvent: 'click'
});

const button = document.getElementById('button');
on(button, 'doubleclick', () => alert('Double clicked'));
```

The function used to register a new custom event type is `registerCustomEvent`,
which just stores the new event's configuration in a [map](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L492).
This config object specifies the original event as well as a handler to
decide when to trigger the custom event based on the original. **metal-dom**
automatically registers a few events when included, via the
[metal-dom/src/events.js](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/events.js#L13)
file.

Once a custom event is registered, it can be subscribed to via the usual
`on`, `once` and `delegate` functions. These functions
[use the event's config](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L447)
to listen to its original event and wrap the given listener with the custom
handler.

### Events simulation (`triggerEvent`)

It's common for developers to need to simulate events in their tests, triggering
the proper listeners. **metal-dom** has a [function](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/domNamed.js#L776)
that helps do this called `triggerEvent`. Note that it's only supposed to be
used inside tests.

### Proxy (`DomEventEmitterProxy`)

We've already learned about [EventEmitterProxy](metal-events/EventEmitterProxy)
when looking at the **metal-events** module. What if instead of proxying events
from an `EventEmitter` to another, we want to proxy them from a DOM element?
That's what `DomEventEmitterProxy` is for, as can be seen in this
[fiddle](https://jsfiddle.net/metaljs/37x9rvt6/).

```js
import { DomEventEmitterProxy } from 'metal-dom';

const origin = document.getElementById('button');
const target = new EventEmitter();

// This will proxy all events from the button to the emitter.
const proxy = new DomEventEmitterProxy(origin, target);

// Listening on the target.
target.on('click', () => alert('Clicked'));
```

`DomEventEmitterProxy` extends `EventEmitter` and overrides a few of its
functions to work for its use case. For example, `shouldProxyEvent_` is
overwritten to only proxy events that are known dom events, otherwise it doesn't
make sense to try, as you can see [here](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/DomEventEmitterProxy.js#L66). The other overwritten function is `addListener_`, since it
needs to use a [different api](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/DomEventEmitterProxy.js#L28)
for subscribing to dom events.

`DomEventEmitterProxy` also allows proxying delegated events, by accepting
special event names with the `delegate:` prefix, and then converting it to a
[delegate call](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/DomEventEmitterProxy.js#L22)
on **metal-dom**.

### Feature checks (`features`)

The `features` exported object offers functions to help check for support of
specific features in the current environment. For example, the
`checkAttrOrderChange` function detects if the browser may change the order
of element attributes when rendering html.

### Script evaluation (`globalEval`, `globalEvalStyles`)

**metal-dom** also offers a way to run js scripts and css styles in the global
scrope, via the `globalEval` and `globalEvalStyles` objects.

Let's start with `globalEval`. It has four main functions:
* `run` - Runs the given string with js code. Creates a new **&lt;script&gt;** tag
with the given js code as its content, and appends it to the document's
**<head>**. Check the code [here](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/globalEval.js#L17).
* `runFile` - Runs the js file in the given path. This works almost the same way
as `run`, by creating a new **&lt;script&gt;** tag with the given src path and
appending it to the document's **<head>**. The main difference is that since
the src file may still need to be fetched the function also accepts a callback
that is run [when the script loads](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/globalEval.js#L44).
* `runScript` - Runs the given **&lt;script&gt;** tag. The given tag isn't reused,
since it may have run before (and so wouldn't work anymore). Instead, this
simply calls either `run` or `runFile` [as appropriate](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/globalEval.js#L76)
to run the code, creating a new tag.
* `runScriptsInElement` - Runs all **&lt;script&gt;** tags in the given element. The
**&lt;script&gt;** tags are found via a `querySelectorAll` [call](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/globalEval.js#L93).
Since the execution order is important this calls another function named
[runScriptsInOrder](https://github.com/metal/metal.js/blob/9f21d053063438139b10fa9f9b74537934f170d5/packages/metal-dom/src/globalEval.js#L110)
to make sure that is followed correctly. `runScript` runs each tag.

`globalEvalStyles` follows the same pattern, with similar implementation:
* `run` - Runs the given string with CSS.
* `runFile` - Runs the CSS file in the given path.
* `runStyle` - Runs the given **&lt;style&gt;** or **&lt;link&gt;** tag.
* `runStylesInElement` - Runs all **&lt;style&gt;** and **&lt;link&gt;** tags
in the given element.

## Next steps

We're done with **metal-dom**, so time to go to **metal-state**.

[↪ Package: metal-state](metal-state.md)
