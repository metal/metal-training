## IncrementalDomRenderer

`IncrementalDomRenderer` is a [subclass](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L11)
of `ComponentRenderer`, which we've already seen
[before](../metal-component/Component.md#rendering-componentrenderer). Any
template language that can be compiled to incremental dom can use it, though it
might be useful to build a new renderer extending from `IncrementalDomRenderer`
for specific features related to the template, if any. Regardless, during the
explanation in this page we'll be using pure incremental DOM, with no
templates, to show that it's template agnostic.

## Rendering

Let's start by rendering a simple component, as in this
[fiddle](https://jsfiddle.net/metaljs/xej2fjaj/).

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class MyComponent extends Component {
	render() {
  	IncrementalDOM.elementOpen('div');
    IncrementalDOM.text('My Component');
    IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent();
console.log(component.element); // <div>My Component</div>
```

*[Debug example](../../playground/examples/metal-incremental-dom/render.js)*

As you can see, when using `IncrementalDomRenderer` components can just
implement a `render` function that calls incremental dom functions, and the
component's element will be receive the rendered content. The `render` function
has to render a single root element (since that will be what `element` is set
to), but its children can be as many as desired.

We've already seen that sub classes of `ComponentRenderer` should override its
`render` method to handle the first render. Let's see how
`IncrementalDomRenderer` does this then.

Looking at the [code](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L122)
you'll see that it does exactly this. The first thing its `render` method does
is to check if the first argument is a component. When called by `Component`
for the first render this will always be true, so that's the branch we should
follow. We'll see what the other is about later.

So on in this case `render` will [call](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L124)
a function named `patch`, which just [calls another](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L106), so let's enter this last one.

As the name indicates, this function is the one that is responsible for starting
incremental dom's patch, which we've seen
[before](../metal-incremental-dom#incremental-dom). Let's think about this a
little before diving further. We've seen the component's element is going to be
rendered by incremental dom calls too, so it makes sense for the code to use
`patchOuter`. Unfortunately `patchOuter` requires an element to be passed as
the first parameter, but on the first render we may not have one yet, unless
it was passed via the component's constructor. Also, this element is required to
have a parent, otherwise `patchOuter` will fail if the contents don't match it,
meaning that it will have to be replaced, since it won't know in which parent to
put the new element replacing it.

That's why we first try to detect these cases and handle them differently. Let's
see how. This internal function called [`patch`](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/patch.js#L61)
does two checks, but we'll skip the first one for now. The second `if` clause
calls a function named `tryPatchWithNoParent_`. This function handles the case
where there's no element or parent by:

1. Creating a [temporary container](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/patch.js#L97)
2. Running [incremental dom's `patch`]((https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/patch.js#L99))
on this container
3. Removing the final rendered element [from this container](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/patch.js#L100) (`element` will be set to the rendered value during
the patch, we'll see how later).
4. Manually attaching the element at the right position if this is not the first
render. During the first render `Component` will automatically attach the
element via the lifecycle we've already seen, so in this case we just let that
handle it.
5 Returns `true` to indicate that the patch was done.

The function that creates this temporary container is [`buildParentIfNecessary_`](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/patch.js#L16).
It will return nothing if the element exists and has a parent though, in which
case `tryPatchWithNoParent_` won't return `true`, indicating that a simpler
approach with `patchOuter` can be used.

`tryPatchWithNoParent_` calls a function named `callPatch_` to do the patching,
so let's see how it does it. Going straight to the point, it uses the third
received argument to [decide](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/patch.js#L43)
if it should use `patch` or `patchOuter`. In this case, since nothing is passed
to it, `patch` is chosen.

The function passed to `patch` is called `render`. `callPatch_` uses an
optimization to avoid binding `render` to receive the component instance every
time though, by doing that only in the first time and [storing its reference](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/patch.js#L40)
in the renderer's data object for that component. This data object is created
on the first time the `getData` function is called for a component, and later
simply retrieved, as you can see from its [code](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/data.js#L19).

We're almost there, let's go inside this `render` function now. You can see that
it does some preparation first, then [calls](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L413)
a function named `renderIncDom` from the renderer, and finishes with some clean
ups. For now let's just look [inside `renderIncDom`](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L144).
This one is pretty straighforward, it checks if the component has a `render`
function, like the one we've implemented in the fiddle example. If so, it calls
it, otherwise it will render an empty div by default, just like
`ComponentRenderer`.

Going back to the `render` function we can see that after all this happens,
and everything is properly rendered, it will call a function named
`cleanUpRender_`. One of the things this does, is to follow the contract we've
learned about before:
[calling](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L75)
the component's `informRendered` function.

That's good enough for a first pass, let's add details incrementally as we learn
about other features now.

## Interception of incremental dom calls

Now that we've gone through the basic rendering flow, it's essential to know
about another important step inside it that we've skipped in the last section.

First, let me bring up the topic of sub components. We'll see how these are
implemented with a lot more detail [later](#sub-components), but this feature
is the most obvious reason for the approach we're about to explain, though it's
important for other features as well.

We need to allow developers to render sub components via their templates, which
will later be compiled to incremental dom. A very common use case of this is
when using [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html), as
in the example below:

```js
<Modal title="My Modal Title" />
```

When compiled to incremental dom, this code would become something like this:

```js
IncrementalDOM.elementVoid(Modal, null, null, 'title', 'My Modal Title');
```

As was mentioned [before](../metal-incremental-dom#incremental-dom) though,
incremental dom doesn't support this, it only accepts actual html tags, not
component functions. So how do we make this work, in way that a call like this
would instantiate a `Modal` component and render its contents in the right
place?

We do this by hijacking incremental dom's functions, so that we can customize
what they do instead of just running them directly. When a sub component is
detected, for example, we ignore the incremental dom call and make others
for that component's contents instead. When a regular html element is to be
rendered though, we can let incremental dom run as usual (though we actually
also do some others things in this case before passing to incremental dom, as
we'll see later).

Let's actually see how the code implements this then. First, let's go back to
the [`render`](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L413)
function that we've seen before. As we already saw, it first calls
`prepareRender_`, but we didn't actually see what that does yet. Looking at
it now you can see that it handles many different things, but I'd like to bring
your attention to the last part, where it [calls](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L382)
`startInterception`. As you can see, its passed an object with two functions:
one for `elementOpen`, which we already know, and another for `attributes`.
We haven't mentioned this last one before, but we'll focus on it
[later](#inline-listeners). Just know for now that it handles updating element
attributes whenever they change, and we also intercept it to customize its
behavior.

[Entering `startInterception`](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/intercept.js#L34)
you can see that it adds some more keys to the given object, and just pushes it
into a stack. These extra keys are for other incremental dom functions which
this module automatically intercepts as well whenever activated. These functions
are all helpers that internally end up calling `elementOpen` and `elementClose`.
For example, `elementVoid` is equivalent to calling these two, one after the
other. Incremental DOM does this by calling some local references to these two
functions though, so our hijacking doesn't work automatically for those helpers.
It would be a pain to force callers to handle this every time, so
`startInterception` converts these calls to the other two, so that callers don't
have to worry about that. Take a look at the [interceptor for `elementVoid`](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/intercept.js#L77)
for example.

The hijacking itself is made as soon as the file with the `startInterception`
function is imported, as can be seen [here](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/intercept.js#L99).
All relevant incremental dom functions are replaced with another, that decides
in real time if the original value should be used or not. This is decided by
accessing that stack that `startInterception` uses, and getting its last
element. When empty, the original functions are used, otherwise the requested
functions are called instead. The reason why this is stored in a stack is
because `startInterception` may be called recursively, the priority being for
last call. When `stopInterception` is called, the last element is
[removed from the stack](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/intercept.js#L46).

That's how the highjacking works. The call inside `prepareRender_` will then
cause all calls to `IncrementalDOM.elementOpen` to go through
`handleInterceptedOpenCall_` instead. A [quick look](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L222)
at it shows that it just checks if the tag is for a component or not, calling
different functions for each case, either `handleSubComponentCall_` or
`handleRegularCall_`. We'll see more about these in the following sections.

Just to wrap it up, inside `cleanUpRender_`, the `stopInterception` [call](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L71)
is done.

## Root element

After a component is rendered, its `element` property is automatically set to
the root element. That's not as easy to do as it seems, since incremental DOM
is the one that handles creating/reusing elements. The `patch` and `patchOuter`
functions both return the final root element, but the rendering flow for a
component doesn't always go through these in reality. Sub components, for
example, are rendered in the same `patch` operation as their parents, so we
wouldn't be able to get the root element like that in these cases.

That's why we instead take advantage of the hijacking already in place to set
the `element` property as soon as the component's renders its first element via
incremental dom calls. This is done inside `handleRegularCall_`, which is the
one that intercepts calls to actual html elements. Looking at its [code](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L284)
you can see that it does many things. We'll focus just on a few right now.

The first thing it does is to grab a [reference to the current component](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L267). This is stored by the `prepareRender_` function,
which [pushes](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L369)
the current component into a stack. Once the rendering is done, the component
is [removed from the stack](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L76) by `cleanUpRender_`.

Afterwards, note that `handleRegularCall_` [calls the original](0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8)
incremental dom function for `elementOpen`, and stores its return value, which
is the node that was used. Later, it [calls](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L287)
`updateElementIfNotReached_`, passing it the current component and the returned
node. This function is the one that [sets])(https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L555)
the `element` property, but only if it knows that the given component hasn't yet
found its root element. The idea is that the component's root will be the first
element rendered by it, otherwise it wouldn't be the root. To track that, we
use a flag named `rootElementReached`, stored in the renderer's data for each
component. It's [set to `false`](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L374)
again every time by `prepareRender_`, and set to `true` in
`updateElementIfNotReached_` once the root is found.

We've covered almost all use cases for setting the `element` now. One that's
still left though is when the component doesn't render anything. That's
supported, as you can see in this
[fiddle](https://jsfiddle.net/metaljs/xn6wwfqy/).

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class MyComponent extends Component {
	render() {
  	// Renders nothing, so the root element should be null or undefined.
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent({
	element: document.createElement('div')
});
console.log(component.element); // null
```

*[Debug example](../../playground/examples/metal-incremental-dom/noContent.js)*

In this case the root element will never be reached, since it doesn't exist. If
we don't do anything else though, it will still be set its previous value,
which in the example above is a div. That's wrong though, as the component has
no element. This use case is handled inside `cleanUpRender_`. After the render
is all done, it [checks the `rootElementReached` flag](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L72).
If it still isn't `true`, the `element` property is manually set to `null`.

## Element references

There may be times when the developer needs to access an element inside his/her
component. The root element can already be accessed via `this.element`, but its
children are harder, since they're created and updated by incremental dom, not
the component itself. It's always possible to use `querySelector` to find
elements, but that's costly. That's why `IncrementalDomRenderer` provides a way
to store references to requested elements, as can be seen in this
[fiddle](https://jsfiddle.net/metaljs/qh19gzmn/).

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class MyComponent extends Component {
	render() {
  	IncrementalDOM.elementOpen('div');
    IncrementalDOM.elementVoid('span', null, null, 'ref', 'inner');
    IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent();

const firstChild = component.element.childNodes[0];
console.log(component.refs.inner === firstChild); // true
```

*[Debug example](../../playground/examples/metal-incremental-dom/elementRefs.js)*

Basically, when an element receives `ref` as an attribute, its reference will be
available in the component's `refs` variable, under the name specified in that
attribute's value.

How is this done? `IncrementalDomRenderer` will run the component's `render`
method, but once that's over all the elements will already have been created
(or reused/removed, etc) and rendered on the page. One option is to traverse
the component's dom from its root, checking if any of them have a `ref`
attribute. That's not how this is currently done though. We instead take
advantage again of the interception that's already set up.

First, before the rendering starts, `prepareRender_` [resets](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L375)
the whole `refs` object from the component. Now let's go back to `handleRegularCall_`,
but focus this time on the [part that handles refs](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L289).
After the node is returned by the original `elementOpen` call, we check if it
has a `ref` attribute. If so, we add it to the component's `refs` map. For now,
let's assume that this `owner` variable that's being used is the current
component. It may be a parent component that passed down children nodes instead,
but we'll see that once we learn more about [sub components](#sub-components).

## Inline listeners

Another feature provided by `IncrementalDomRenderer` is the ability of
specifying event listeners via html attributes. Check it out in this
[fiddle](https://jsfiddle.net/metaljs/9gkmhaj6/).

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

const fnListener = () => alert('Clicked Button 1');

class MyComponent extends Component {
	handleClick() {
  	alert('Clicked Button 2');
  }

	render() {
	  IncrementalDOM.elementOpen('div')

    // Using `on[EventName]` format, with a function reference.
		IncrementalDOM.elementOpen('button', null, null, 'onClick', fnListener);
    IncrementalDOM.text('Button 1');
    IncrementalDOM.elementClose('button');

    // Using `data-on[eventname]` format, with a function name.
    IncrementalDOM.elementOpen('button', null, null, 'data-onclick', 'handleClick');
    IncrementalDOM.text('Button 2');
    IncrementalDOM.elementClose('button');

		IncrementalDOM.elementClose('div')
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

new MyComponent();
```

As you can see there are two different supported formats for event listener
attributes: **on[EventName]** and **data-on[eventname]**. Both work the same way,
accepting both function references and names. The only difference between them
is that **data-on[eventname]** is actually set as the element's attribute in
the rendered html when the value is a function name, while **on[EventName]**
never is, as otherwise it would conflict with the real `on[eventname]`
attributes.

Let's see how they work now. For that we'll go back to the `startInterception`
[call](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-incremental-dom/src/render/render.js#L383),
where we request that `IncrementalDOM.attributes` is hijacked by
`handleInterceptedAttributesCall_`. As was mentioned before, this function is
used by incremental dom to apply an element's attribute when its value changes.

## Element classes

## Sub components

### Reusage strategy

### Children

### Automatic cleanup of unused sub components

## Updates

## Next steps

Next we'll take a look at: **metal-soy**.

[↪ Package: metal-soy](../metal-soy.md)
