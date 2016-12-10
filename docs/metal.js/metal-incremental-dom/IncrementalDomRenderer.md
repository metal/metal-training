## IncrementalDomRenderer

`IncrementalDomRenderer` is a [subclass](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L11)
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

Looking at the [code](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L122)
you'll see that it does exactly this. The first thing its `render` method does
is to check if the first argument is a component. When called by `Component`
for the first render this will always be true, so that's the branch we should
follow. We'll see what the other is about later.

So on in this case `render` will [call](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L124)
a function named `patch`, which just [calls another](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L106), so let's enter this last one.

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
see how. This internal function called [`patch`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/patch.js#L61)
does two checks, but we'll skip the first one for now. The second `if` clause
calls a function named `tryPatchWithNoParent_`. This function handles the case
where there's no element or parent by:

1. Creating a [temporary container](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/patch.js#L97)
2. Running [incremental dom's `patch`]((https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/patch.js#L99))
on this container
3. Removing the final rendered element [from this container](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/patch.js#L100) (`element` will be set to the rendered value during
the patch, we'll see how later).
4. Manually attaching the element at the right position if this is not the first
render. During the first render `Component` will automatically attach the
element via the lifecycle we've already seen, so in this case we just let that
handle it.
5 Returns `true` to indicate that the patch was done.

The function that creates this temporary container is [`buildParentIfNecessary_`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/patch.js#L16).
It will return nothing if the element exists and has a parent though, in which
case `tryPatchWithNoParent_` won't return `true`, indicating that a simpler
approach with `patchOuter` can be used.

`tryPatchWithNoParent_` calls a function named `callPatch_` to do the patching,
so let's see how it does it. Going straight to the point, it uses the third
received argument to [decide](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/patch.js#L43)
if it should use `patch` or `patchOuter`. In this case, since nothing is passed
to it, `patch` is chosen.

The function passed to `patch` is called `render`. `callPatch_` uses an
optimization to avoid binding `render` to receive the component instance every
time though, by doing that only in the first time and [storing its reference](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/patch.js#L40)
in the renderer's data object for that component. This data object is created
on the first time the `getData` function is called for a component, and later
simply retrieved, as you can see from its [code](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/data.js#L19).

We're almost there, let's go inside this `render` function now. You can see that
it does some preparation first, then [calls](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L412)
a function named `renderIncDom` from the renderer, and finishes with some clean
ups. For now let's just look [inside `renderIncDom`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L144).
This one is pretty straighforward, it checks if the component has a `render`
function, like the one we've implemented in the fiddle example. If so, it calls
it, otherwise it will render an empty div by default, just like
`ComponentRenderer`.

Going back to the `render` function we can see that after all this happens,
and everything is properly rendered, it will call a function named
`cleanUpRender_`. One of the things this does, is to follow the contract we've
learned about before:
[calling](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L75)
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
the [`render`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L410)
function that we've seen before. As we already saw, it first calls
`prepareRender_`, but we didn't actually see what that does yet. Looking at
it now you can see that it handles many different things, but I'd like to bring
your attention to the last part, where it [calls](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L379)
`startInterception`. As you can see, its passed an object with two functions:
one for `elementOpen`, which we already know, and another for `attributes`.
We haven't mentioned this last one before, but we'll focus on it
[later](#inline-listeners). Just know for now that it handles updating element
attributes whenever they change, and we also intercept it to customize its
behavior.

[Entering `startInterception`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/intercept.js#L34)
you can see that it adds some more keys to the given object, and just pushes it
into a stack. These extra keys are for other incremental dom functions which
this module automatically intercepts as well whenever activated. These functions
are all helpers that internally end up calling `elementOpen` and `elementClose`.
For example, `elementVoid` is equivalent to calling these two, one after the
other. Incremental DOM does this by calling some local references to these two
functions though, so our hijacking doesn't work automatically for those helpers.
It would be a pain to force callers to handle this every time, so
`startInterception` converts these calls to the other two, so that callers don't
have to worry about that. Take a look at the [interceptor for `elementVoid`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/intercept.js#L77)
for example.

The hijacking itself is made as soon as the file with the `startInterception`
function is imported, as can be seen [here](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/intercept.js#L99).
All relevant incremental dom functions are replaced with another, that decides
in real time if the original value should be used or not. This is decided by
accessing that stack that `startInterception` uses, and getting its last
element. When empty, the original functions are used, otherwise the requested
functions are called instead. The reason why this is stored in a stack is
because `startInterception` may be called recursively, the priority being for
last call. When `stopInterception` is called, the last element is
[removed from the stack](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/intercept.js#L46).

That's how the highjacking works. The call inside `prepareRender_` will then
cause all calls to `IncrementalDOM.elementOpen` to go through
`handleInterceptedOpenCall_` instead. A [quick look](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L222)
at it shows that it just checks if the tag is for a component or not, calling
different functions for each case, either `handleSubComponentCall_` or
`handleRegularCall_`. We'll see more about these in the following sections.

![Interception](../../../diagrams/Interception.png)

Just to wrap it up, inside `cleanUpRender_`, the `stopInterception` [call](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L71)
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
one that intercepts calls to actual html elements. Looking at its [code](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L284)
you can see that it does many things. We'll focus just on a few right now.

The first thing it does is to grab a [reference to the current component](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L267). This is stored by the `prepareRender_` function,
which [pushes](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L366)
the current component into a stack. Once the rendering is done, the component
is [removed from the stack](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L76) by `cleanUpRender_`.

Afterwards, note that `handleRegularCall_` [calls the original](68005b320d1b8979f910ddae0baaf63b160e7a06)
incremental dom function for `elementOpen`, and stores its return value, which
is the node that was used. Later, it [calls](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L287)
`updateElementIfNotReached_`, passing it the current component and the returned
node. This function is the one that [sets](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L555)
the `element` property, but only if it knows that the given component hasn't yet
found its root element. The idea is that the component's root will be the first
element rendered by it, otherwise it wouldn't be the root. To track that, we
use a flag named `rootElementReached`, stored in the renderer's data for each
component. It's [set to `false`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L371)
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
is all done, it [checks the `rootElementReached` flag](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L72).
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

First, before the rendering starts, `prepareRender_` [resets](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L375)
the whole `refs` object from the component. Now let's go back to `handleRegularCall_`,
but focus this time on the [part that handles refs](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L289).
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
    IncrementalDOM.elementOpen('div');

    // Using `on[EventName]` format, with a function reference.
    IncrementalDOM.elementOpen('button', null, null, 'onClick', fnListener);
    IncrementalDOM.text('Button 1');
    IncrementalDOM.elementClose('button');

    // Using `data-on[eventname]` format, with a function name.
    IncrementalDOM.elementOpen('button', null, null, 'data-onclick', 'handleClick');
    IncrementalDOM.text('Button 2');
    IncrementalDOM.elementClose('button');

    IncrementalDOM.elementClose('div');
  }
}
MyComponent.RENDERER = IncrementalDomRenderer;

new MyComponent();
```

*[Debug example](../../playground/examples/metal-incremental-dom/listeners.js)*

As you can see there are two different supported formats for event listener
attributes: **on[EventName]** and **data-on[eventname]**. Both work the same way,
accepting both function references and names. The only difference between them
is that **data-on[eventname]** is actually set as the element's attribute in
the rendered html when the value is a function name, while **on[EventName]**
never is, as otherwise it would conflict with the real `on[eventname]`
attributes.

Let's see how they work now. For that we'll go back to the `startInterception`
[call](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L380),
where we request that `IncrementalDOM.attributes` is hijacked by
`handleInterceptedAttributesCall_`. As was mentioned before, this function is
used by incremental dom to apply an element's attribute when its value changes.
In the end it only calls another function called `applyAttribute`, passing it
the current component plus all args it received.

[Inside `applyAttribute`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/attributes.js#L18),
the first thing that is done is a call to `getEventFromListenerAttr_`. This
function runs the attribute's name through a regex, returning the event name
it references, or `null` if it's not an event listener attribute. If it is
though, `applyAttribute` will then [call](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/attributes.js#L21) `attachEvent_`, which does the actual subscription.

First, `attachEvent_` checks if the given element already has a handle for the
specified event name. If so, that handle is detached, as it won't be used
anymore. Then, if no listener function is given, the attribute is
[removed](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/attributes.js#L78)
from the element, as expected. Otherwise, the attribute is set if in the format
**data-on[eventname]** (as has already been explained), the listener is
converted to a function if given as a name, and finally attached via a
`delegate` call. Note that all inline listeners will be attached using
`delegate`, with `document` as the container. That's better for performance
than attaching new listeners for each element, so this is already handled
automatically for the developer.

Although it initially feels like this covers everything, there's still one edge
case missing. As was said, incremental dom's `attributes` function is only
called when it detects that the element's attribute value has changed. What
happens if a page that was previously rendered by the server is later rendered
via a Metal.js component? Check out this
[fiddle](https://jsfiddle.net/metaljs/h1fsz52t/) for example.

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class MyComponent extends Component {
	handleClick() {
  	alert('Clicked Button');
  }

	render() {
    IncrementalDOM.elementOpen('button', null, null, 'data-onclick', 'handleClick');
    IncrementalDOM.text('Button');
    IncrementalDOM.elementClose('button');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const element = document.createElement('button');
element.setAttribute('data-onclick', 'handleClick');
new MyComponent({element});
```

*[Debug example](../../playground/examples/metal-incremental-dom/listenersDecorated.js)*

On this first render, the component will reuse all the
contents thanks to incremental dom, but if these contents already had attributes
in the **data-on[eventname]** format set, like in the example above, then their
values won't change, meaning that `attributes` won't be called at all. Unless
we handle this case separately, these events won't ever be subscribed to.

That's why inside `handleRegularCall_` there's also a [call](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L286)
to a function named `attachDecoratedListeners_`. This function only ever does
anything for a component [on its first render](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L47), in which case it loops through all attributes calling
`attachFromAttrFirstTime`. This [last function](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/attributes.js#L43)
does almost exactly the same as `applyAttribute`, calling first
`getEventFromListenerAttr_` to get the event name, and then `attachEvent_` to
subscribe to it. The only difference here is that it will only subscribe it if
it hasn't already done so before. This is what fixes the hybrid rendering case.

## Element classes

We've already talked about the `elementClasses` property
[before](../metal-component/Component.md#elementclasses), which is defined
for all components by `Component` itself. It doesn't really do anything by
default when using the base `ComponentRenderer`, but `IncrementalDomRenderer`
makes sure that the value passed to `elementClasses` is set as the component
element's class, as can be seen in this
[fiddle](https://jsfiddle.net/metaljs/hqwpcefb/).

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class MyComponent extends Component {
  render() {
    IncrementalDOM.elementVoid('div');
  }
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent({elementClasses: 'myClass'});
console.log(component.element);
// <div class="myClass"></div>
```

*[Debug example](../../playground/examples/metal-incremental-dom/elementClasses.js)*

For this to work we need to change the attributes incremental dom receives on
the call to build the component's root element. That's yet another use case for
`handleRegularCall_`. Looking at the [code](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L277)
you can see that this is done before the original incremental dom is called,
so that we have time to change its arguments first. Since `elementClasses` is
only supposed to be passed to the root element, we again check that now familiar
`rootElementReached` flag to detect it. Then we get the value of `elementClasses`
from the data manager, and [pass it](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L280)
to `addElementClasses_`.

Now `addElementClasses_` needs to pass `elementClasses` together with the other
attributes that incremental dom received from the `elementOpen` call. There are
two cases to be handled here:

1. If no `class` attribute was passed, we just need to pass it now.
2. If a `class` attribute was already being passed, we need to merge
`elementClasses` with it, removing any possible duplicates.

That's exactly [what `addElementClasses_` does](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L26).
The only thing a bit weird is how. It receives all the arguments passed to
`elementOpen` as an array but, as you've probably already noticed, they're hard
to handle, since there may be attributes in the statics array passed as the
third parameter, or in any of the other parameters passed afterwards. To
simplify this, the function calls `buildConfigFromCall`, which simply turns the
arguments array [into an object](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/callArgs.js#L9). Once `elementClasses` is added to it, it's converted
[back to an array](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/callArgs.js#L27)
via `buildCallFromConfig`.

## Updates

We've already seen that `Component` tracks changes to its data, calling the
renderer's `update` function when they're detected. Let's see how this works
when using `IncrementalDomRenderer`. Check out this
[fiddle](https://jsfiddle.net/metaljs/48759mzf/).

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class MyComponent extends Component {
	render() {
    IncrementalDOM.elementOpen('div');
    IncrementalDOM.text(this.foo);
    IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;
MyComponent.STATE = {
	foo: {
  	value: 'foo'
  }
};

const component = new MyComponent();
console.log(component.element); // <div>foo</div>

component.foo = 'bar';
component.once('stateSynced', function() {
	console.log(component.element); // <div>bar</div>
});
```

*[Debug example](../../playground/examples/metal-incremental-dom/updates.js)*

Instead of going straight to the renderer's `update` method, let's first take
a look at its [`setUp`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L172).
If you remember, this function is called by `Component` in its constructor, to
allow the renderer to do any preparations it needs. As you can see it does a few
minor things, but at the end it also [runs](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L179)
a function called `trackChanges`. The only thing this does is to listen to the
[synchronous change event](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/changes.js#L42)
from `State`, storing the data about each change in the renderer's data.

But why would we need that at all when `Component` tracks changes and calls the
renderer at the appropriate time? Again this is necessary because of sub
components, which may receive new data from parent components during render.
In these cases the sub component is rendered by the parent right after receiving
the new data though, so it doesn't make sense to update them once the batch
event is triggered later. Tracking these changes here prevents this problem,
as they're [cleared](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L373)
again whenever the component is rendered, and we'll see that even when `update`
is called, it will only run if this changes object has content.

Now we can look at `update`. It first [checks](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L211)
if the update should happen and, if so, calls the same `patch` function as
`render` does. [Inside `shouldUpdate`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L188),
`false` is returned if the changes object is `null`.

If that passes there's still [another check](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L192)
though. If the component has a `shouldUpdate` function, it will be called with
the current changes. This allows components to optimize their own render
operation manually, if they wish to. Its return value will determine if the
update happens or not. When it doesn't exist, the return value will be `true`.

## Sub components

Now it's time to start talking properly about sub components. This is a big
feature, so we'll split this into many sub topics.

### Render by class reference

Let's start by the most common use case: rendering a sub component by passing
a reference to its class to an incremental dom call. Check out this
[fiddle](https://jsfiddle.net/metaljs/dvmpwtk9/) example.

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class ChildComponent extends Component {
	render() {
		IncrementalDOM.elementOpen('span');
		IncrementalDOM.text('Child');
		IncrementalDOM.elementClose('span');
	}
}
ChildComponent.RENDERER = IncrementalDomRenderer;

class MyComponent extends Component {
	render() {
		IncrementalDOM.elementOpen('div');
		IncrementalDOM.elementVoid(ChildComponent);
		IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent();
console.log(component.element);
// <div><span>Child</span></div>
```

*[Debug example](../../playground/examples/metal-incremental-dom/nested.js)*

As you already know, the main interceptor function is
`handleInterceptedOpenCall_`, so let's start there. The only thing it does is
to separate sub component calls from regular html element calls, handling each
with a different function. This [check](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L249)
is done via `isComponentTag_`, which [accepts](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L318)
all tags that are functions (which includes classes), as well as strings that
start with an uppercase letter. We'll assume the first case for now, which is
the one used by the example above.

Since the tag is a function, `handleSubComponentCall_` will handle it. Before
doing anything to the sub component at all, this first start capturing
incremental dom calls for children elements being passed to it. We'll see this
in more detail [later](#children) but, for now, let's ignore this since the
example we're analysing doesn't pass any children to the sub component anyway.

All you need to know for now is that the function passed to `captureChildren`,
called `handleChildrenCaptured_`, will be called automatically when children
are ready, so let's jump directly to it. Inside it we'll again ignore the part
about children and note that it [calls](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L211)
`renderFromTag_`, which in turn [calls](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L433)
`renderSubComponent_` since the tag is a component class. That's the main
function we want to analyse at this time.

`renderSubComponent_` will first get the component instance for the given class
[via `getSubComponent_`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L487). We won't go inside that just yet, just
know for now that it'll decide if a new instance should be created for this, or
if it can reuse another instance that was created before. With the component
instance ready, its renderer's `renderInsidePatch` function will be
[called](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L500).

Instead of running another `patch`, this function skips that part and
[calls `render` directly](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L162),
since it knows that a patch is already on course.  If this is not the sub
component's first render and `shouldUpdate` returns `false`, the rendering will
be [skipped](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L164)
altogether, with the help of another incremental dom function called
[`skipNode`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L202).

Going back to `renderSubComponent_`, there's one final step we should take a
look at. When the sub component is being rendered for the first time, a function
called `renderComponent` will be [called on it](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L502).
That's important because, since the component didn't go through its usual render
flow, we need to tell it to run the other behaviors expected to happen after a
render, such as [calling "sync" methods](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-component/src/Component.js#L466)
and [running the attach lifecycle](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-component/src/Component.js#L467).

### Render by class name

It's also possible to render a sub component by passing its class name to an
incremental dom call. Check out this
[fiddle](https://jsfiddle.net/metaljs/gsmek5bs/) example.

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class ChildComponent extends Component {
	render() {
		IncrementalDOM.elementOpen('span');
		IncrementalDOM.text('Child');
		IncrementalDOM.elementClose('span');
	}
}
ChildComponent.RENDERER = IncrementalDomRenderer;

// Calling this is required for the component to be referenced by
// its class name in incremental dom calls.
ComponentRegistry.register(ChildComponent);

class MyComponent extends Component {
	render() {
		IncrementalDOM.elementOpen('div');
		IncrementalDOM.elementVoid('ChildComponent');
		IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent();
console.log(component.element);
// <div><span>Child</span></div>
```

Note that calling `ComponentRegistry.register` is required in this case. As
we've already seen, this call will store a mapping between the class name and
its reference, which can be retrieved later via
`ComponentRegistry.getConstructor`. That's how `IncrementalDomRenderer` manages
to support this use case. Taking a [quick look](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L178)
at `getSubComponent_` you'll see that the first thing it does is to convert
the given string tag to a class constructor when necessary.

### References

Similarly to how element references can be obtained by passing them a `ref`
attribute, it's also possible to get sub component references using `ref`.
Take a look at this [fiddle](https://jsfiddle.net/metaljs/obr8py3a/).

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class ChildComponent extends Component {
	render() {
		IncrementalDOM.elementOpen('span');
		IncrementalDOM.text('Child');
		IncrementalDOM.elementClose('span');
	}
}
ChildComponent.RENDERER = IncrementalDomRenderer;

class MyComponent extends Component {
	render() {
		IncrementalDOM.elementOpen('div');
		IncrementalDOM.elementVoid(ChildComponent, null, null, 'ref', 'child');
		IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent();
console.log(component.refs.child.element); // <span>Child</span>
```

*[Debug example](../../playground/examples/metal-incremental-dom/nestedRef.js)*

This is done inside `getSubComponent_`. We still won't go into the particulars
of everything that this function does, but when it detects that the sub
component to be handled [has a `ref`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L186),
it stores its reference in its owner's `refs` variable. Note that it also stores
the same thing in the owner's `components` property. That's mainly for backwards
compatibility, as this used to be the name of the map when Metal.js was just
built, but since we started storing refs to regular elements as well, calling it
`components` stopped making much sense, so the more generic `refs` name was
adopted. We'll drop `components` in the next major version.

Just to make it clear, this `owner` component that `getSubComponent_` uses to
store the reference in is [passed to it](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L487)
by `renderSubComponent_`, and we'll assume for now that it's always passing the
current component, which is the sub component's direct parent. We'll see when
this can be different when we're talking about [children](#children) later.

### Sharing root element between components

It's possible to share the same root element between a parent and its sub
component, as can be seen in this
[fiddle](https://jsfiddle.net/metaljs/jxpeydz8/).

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class ChildComponent extends Component {
	render() {
		IncrementalDOM.elementOpen('span');
		IncrementalDOM.text('Child');
		IncrementalDOM.elementClose('span');
	}
}
ChildComponent.RENDERER = IncrementalDomRenderer;

class MyComponent extends Component {
	render() {
		IncrementalDOM.elementVoid(ChildComponent, null, null, 'ref', 'child');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent();
console.log(component.element) // <span>Child</span>
console.log(component.element === component.refs.child.element); // true
```

We already know how `IncrementalDomRenderer` sets a component's `element`
property. The code we've seen so far would only cover setting `element` for
the child component in the above example though, as that will be the current
component being rendered when the call for rendering the **span** tag is run.

This shows that some components may actually not render their own root elements
directly, but have them rendered by a sub component instead. This use case is
handled right after a sub component is rendered, inside [`renderFromTag_`](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L434).
After the `renderSubComponent_` is done, the sub component will have finished
rendering, and so the current component will be its parent again. That's when
`updateElementIfNotReached_` is called once more, but this time for the parent,
which will now have the right reference to its element as well.

### Reusage strategy

When a component's data changes, causing an update, the calls for its sub
components run again. `IncrementalDomRenderer` will try to match previous
instances with new calls, so they can be reused as much as possible, instead
of recreated every time. Take a look at this
[fiddle](https://jsfiddle.net/metaljs/268sskuj/).

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class ChildComponent extends Component {
	render() {
		IncrementalDOM.elementVoid('span');
	}
}
ChildComponent.RENDERER = IncrementalDomRenderer;

class MyComponent extends Component {
	render() {
  	IncrementalDOM.elementOpen('div');
    IncrementalDOM.elementVoid(ChildComponent, null, null, 'ref', 'child');
		IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;
MyComponent.STATE = {
	foo: {
  	value: 'foo'
  }
};

const component = new MyComponent();
const child = component.refs.child;

component.foo = 'bar';
component.once('stateSynced', function() {
  console.log(child === component.refs.child); // true
});
```

The logic for reusing sub component instances, as well as creating new ones, is
done [inside](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L175)
`getSubComponent_`. Let's see the case where `ref` is given first, which is what
happens in the example above. In this case, we'll enter the first code branch,
which calls `match_`, passing the current component with this ref (if any),
the class constructor that should be used, the sub component's config data and
its owner component. `match_` will return the final sub component instance, so
let's see [what it does](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L347)
now.

It first [calls](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L349)
`isMatch_` to check if the previous component can be reused. It will return
`true` only if this component's constructor matches the requested one, hasn't
been disposed yet, and had the same owner. In this case, `match_` will only
update the sub component's data via its data manager's `replaceNonInternal`
function. Otherwise, it will
[create a new instance](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L353)
for the sub component, passing it the data via the constructor. Note that when
it does that, it passes `false` as the constructor's second parameter to prevent
this new component from being rendered in the usual way, since we want it to be
handled differently, reusing its parent's ongoing patch operation.

What happens if no `ref` is given though? In this case the code tries to match
sub components according to a specified `key` or, as the last resource, to their
position in the parent element. To do this it stores an object in dom elements,
that keep track of the sub components that were rendered inside them. That's the
object returned by the [`getCurrentData` call](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L188). Looking inside it you can see that it uses `domData` for
this. Also note that if the current parent element is the component's direct
parent, this data object will instead come from the renderer's data for that
component. This is to support use cases where a component may render multiple
empty sub components at the root, which is possible since that won't break the
rule of having at most one root element. That would mess up the reusage logic
if the parent element's data was used though, as these components should tied to
the location of their parent component, not its parent element.

Once this data object is available inside `getSubComponent_`, it will check if
the sub component was given a key. If so, it will try to match it with a
previous component with the same key in the current parent element, which is
the same thing incremental dom does for dom elements with keys. If no key is
given, it will [generate one](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L194)
based on the position of this sub component, as well as its constructor function.

Note that inside `handleRegularCall_` this object from `domData` is [reset](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L285)
by `prepareRender_`, so that the components added last are considered previous
components in this new render operation. The [same](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L369)
happens before rendering, to reset the object stored in the renderer's data for
the current component.

### Children

Another important feature is the ability to pass dom elements to be rendered by
sub components. This can be done by just making incremental dom calls between
the `elementOpen` and `elementClose` calls for the sub component. The sub
component code can then decide where these children will be rendered by calling
`IncrementalDomRenderer.renderChild`. Check it out in this
[fiddle](https://jsfiddle.net/metaljs/yj06qzLe/).

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class ChildComponent extends Component {
	render() {
		IncrementalDOM.elementOpen('span');
    this.children.forEach(IncrementalDomRenderer.renderChild);
    IncrementalDOM.elementClose('span');
	}
}
ChildComponent.RENDERER = IncrementalDomRenderer;

class MyComponent extends Component {
	render() {
  	IncrementalDOM.elementOpen('div');
    IncrementalDOM.elementOpen(ChildComponent);
    IncrementalDOM.text('Text from parent');
    IncrementalDOM.elementClose(ChildComponent);
		IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent();
console.log(component.element);
// <div><span>Text from parent</span></div>
```

*[Debug example](../../playground/examples/metal-incremental-dom/children.js)*

As you can see, sub components receive any children content in a property called
`children`. If you inspect this property you'll see that it's an array of
objects, each representing a child node that was passed down. Clearly, this
isn't done by incremental dom. It has no notion of components, much less of
passing contents to them. To achieve this we capture all calls done inside
`elementOpen` and `elementClose` calls to sub components, and instead of running
them we convert them into objects and pass them along to these components.

#### Capturing children

Let's start by the code that does the capturing. It all starts inside
`handleSubComponentCall_`, with the [call](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L305)
to `captureChildren` that we've skipped before. Now we'll actually see how it
works. It starts by storing the received data for later use, [creating an object](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/children/children.js#L25)
to store the captured children and then calling `startInterception`.

Let's take
a look at the interceptor for `elementOpen` first, `handleInterceptedOpenCall_`.
It just [calls](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/children/children.js#L165)
`addChildCallToTree_`. This function creates an object for the new child,
storing a reference to [the owner component](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/children/children.js#L113)
inside it. That's important because when using refs we need to know which
component made a certain incremental dom call, not the sub component that
rendered it. Afterwards, the received arguments are stored in the object as well,
and this object is [added to the parent element](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/children/children.js#L133).
Once `addChildCallToTree_` is done, its result is [set as the current parent](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/children/children.js#L165). The interceptor for `text` is `handleInterceptedTextCall_`, which only calls
`addChildCallToTree_`, indicating that it's a text node.

Finally, `elementClose` is intercepted by `handleInterceptedCloseCall_`. If when
this is called, the current parent is the initial tree object, that means that
the children capturing has ended. In this case `stopInterception` is [called](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/children/children.js#L143), data is reset and the given callback function
is [run](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/children/children.js#L145) with the final data. If the capturing hasn't finished
yet though, the current parent is [updated](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/children/children.js#L153).

The callback that is called when everything is done is `handleChildrenCaptured_`.
It [sets](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L305)
the `children` property in the sub component's data to the captured calls.

#### Rendering children

Now let's see how the `renderChild` method from `IncrementalDomRenderer` works.
It just [calls](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L135)
another function called `renderChild`, which in turn calls `renderChildTree`,
passing it the child object and `handleChildRender_` as a callback function.

`renderChildTree` is the one that does most of the work. If it detects that
it's been called during children capture, it ignores trying to render anything
and just [adds](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/children/children.js#L68)
the object as it is to the captured data. In the usual case it will actually
render the child, calling the appropriate incremental dom functions for them,
which are already being intercepted by `IncrementalDomRenderer` as usual.
Instead of just passing each child's tag to `elementOpen` though, it passes an
object indicating both the tag and the child's owner. That's important so that
the interceptor function, `handleRegularCall_`, can know who the child's owner
is when storing refs. Children of the given child object are rendered
[recursively](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/children/children.js#L89)
by `renderChildTree` as well.

Before actually rendering anything, `renderChildTree` first calls the function
given as the second param, and ignores the child if this function returns `true`.
As we've already seen, this function is `handleChildRender_`, which handles
sub components passed as children, so that they don't need to recapture any
children of their own through interception again. It uses the `children` already
captured in the child object and [calls](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L225)
`renderFromTag_`, passing it the child's owner component, which will then be
used instead of the currently rendering component for storing refs.

### Automatic cleanup of unused sub components

Sometimes, for various reasons, sub components won't be reused when a parent is
updated. In these cases, `IncrementalDomRenderer` takes care of disposing these
now unused instances automatically for the developer. Check it out in this
[fiddle](https://jsfiddle.net/metaljs/ydq1pxpu/).

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class ChildComponent extends Component {
	render() {
		IncrementalDOM.elementVoid('span');
	}
}
ChildComponent.RENDERER = IncrementalDomRenderer;

class MyComponent extends Component {
	render() {
  	IncrementalDOM.elementOpen('div');
    if (!this.removeChild) {
	    IncrementalDOM.elementVoid(ChildComponent, null, null, 'ref', 'child');
		}
		IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;
MyComponent.STATE = {
	removeChild: {}
};

const component = new MyComponent();
const child = component.refs.child;

component.removeChild = true;
component.once('stateSynced', function() {
	console.log(child.isDisposed()); // true
  console.log(component.refs.child); // undefined
});
```

This automatic disposal is done by keeping track of all the children of each
component. Every time a new component is rendered, it's [added](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L495)
to its parent list of children inside `renderSubComponent_`. Right before the
render operation, in `prepareRender_`, this list is reset, and the previous
list of components are [scheduled](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L375)
for a possible future disposal, which happens when the
[last component being rendered is done](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L86).

Let's first look at this `schedule` function. It just loops through the given
list, [clearing the parent](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/cleanup/unused.js#L39)
of each given component and adding them to a queue. When a component is rendered,
its parent is [set](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L491)
to a new value. So, when `disposeUnused` is called after all components finish
rendering, all scheduled components that still don't have a parent are [disposed](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/cleanup/unused.js#L24).

## Componentless functions

Besides component classes, `IncrementalDomRenderer` also allows passing simple
functions as tags to incremental dom calls, as in this
[fiddle](https://jsfiddle.net/metaljs/qx1g3zya/).

```js
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

function myFn({content}) {
  IncrementalDOM.elementOpen('span');
  IncrementalDOM.text(content);
  IncrementalDOM.elementClose('span');
}

class MyComponent extends Component {
	render() {
  	IncrementalDOM.elementOpen('div');
	   IncrementalDOM.elementVoid(myFn, null, null, 'content', 'Function content');
		IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent();
console.log(component.element);
// <div><span>Function content</span></div>
```

*[Debug example](../../playground/examples/metal-incremental-dom/functionTags.js)*

This is pretty straightforward to explain. Instead of trying to render a
component, when `renderFromTag_` detects that the given tag is a function it
just [calls it](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-incremental-dom/src/render/render.js#L437),
passing it an object with the attributes data.

## Next steps

Next we'll take a look at: **metal-soy**.

[↪ Package: metal-soy](../metal-soy.md)
