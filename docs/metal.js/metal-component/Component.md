# Component

Here we'll learn about the features provided by `Component` and how they work.

## Lifecycle

First let's learn about `Component`'s main lifecycle functions. There are five
of them: `created`, `attached`, `rendered`, `detached` and `disposed`. Check
them out in this [fiddle](https://jsfiddle.net/metaljs/ha14u52t/).

```js
import Component from 'metal-component';

class MyComponent extends Component {
  /**
   * Called once the component has been created and is ready to be used.
   */
	created() {
  	console.log('created ');
	}

  /**
   * Called when the component has been rendered.
   * @param {boolean} firstRender True on the first render, false otherwise.
   */
  rendered() {
  	console.log('rendered ');
  }

  /**
   * Called when the component has been added to the DOM.
   */
  attached() {
  	console.log('attached ');
	}

  /**
   * Called when the component has been removed from the DOM.
   */
  detached() {
  	console.log('detached ');
	}

  /**
   * Called when the component has been destroyed.
   */
  disposed() {
  	console.log('disposed');
	}
}

const component = new MyComponent();
// created rendered attached

component.dispose();
// detached disposed
```

Note that as soon as a component is instantiated, it's automatically rendered
as well.

These are the default lifecycle functions, but there may be more depending on
which renderer you are using. For example, the renderer for JSX adds a `render`
lifecycle function, where the developer should add the JSX contents to be
rendered for the component. The soy templates renderer doesn't need such a
function though, since the templates need to be in a separate file.

Let's take a look at where in the code these five functions are called. We'll
start with `Component`'s [constructor](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L73). You can see that it prepares many things, and then
[calls](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L133)
the `created` lifecycle when all is done, right before rendering.

The `rendered` lifecycle will be explained later with more details, but know
for now that it [runs](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L397)
inside `informRendered`, which is called by the renderer when ready. After
the rendering is done, `renderComponent` will [call](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L467)
`attach` to add the rendered contents to the DOM, which in turn [calls](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L183)
the `attached` lifecycle function.

When `dispose` is called on a component, it will be destroyed. This method
comes from `Disposable`, a [class](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal/src/disposable/Disposable.js#L10)
from the **metal** module. `Component` [extends](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L62)
`EventEmitter`, which in turn [extends](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-events/src/EventEmitter.js#L13)
`Disposable`. All `dispose` does is to
[call](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal/src/disposable/Disposable.js#L25)
a `disposeInternal` function, implemented by sub classes to clear any data and
listeners that won't be used anymore. The first thing that `Component`'s
`disposeInternal` function does is to [call](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L271)
`detach` to remove its contents from the DOM, which is turn [calls](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L246)
the `detached` lifecycle function. Right after this is done, `disposeInternal`
[calls](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L272)
the `disposed` lifecycle as well.

## Element

`Component` instances each have a property called `element`, which stores a
reference to the current DOM element representing its contents. This can be
passed to the component via the constructor, as can be seen in this
[fiddle](https://jsfiddle.net/metaljs/m77yu296/).

```js
import Component from 'metal-component';

const componentElement = document.getElementById('component');
const component = new Component({
	element: componentElement
});
console.log(component.element === componentElement); // true
```

The element can also be set to other values after the component is created,
and may even be set to selectors instead of actual elements. In this case, it
will automatically search for a node that matches the given selector and receive
its value, as can be seen in this
[fiddle](https://jsfiddle.net/metaljs/drtbb7re/).

```js
import Component from 'metal-component';

const component = new Component({
	element: '#el1'
});
console.log(component.element === document.getElementById('el1')); // true

component.element = '#el2';
console.log(component.element === document.getElementById('el2')); // true
```

*[Debug example](../../playground/examples/metal-component/element.js)*

To make this work we use the [getter](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/get)
and [setter](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/set)
apis. We store the actual value for `element` in a variable named
`elementValue_`, and all the getter does is to [return it](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L145).

The [setter](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L475),
on the other hand, does more. It first [validates](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L476) the received value, accepting only strings, elements and
null/undefined. Then, it converts the given value into a DOM element, [using](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L481)
the `toElement` function from **metal-dom**. When the new value is
[different](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L484)
from the first one, it [emits](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L343)
an event informing about it. Finally, when the element is set after the first
render, its visibility is [updated](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L348)
according to the value of the component's `visible` data. We'll learn more
about data later, so let's leave the details of this part till then.

Note that this setter behavior is very similar to what we've seen that `State`
can do, and also similar to what the component's properties handled by the
manager follow, as we'll see later. `element` is meant to be accessible in the
same way in all components though, which is why it's not handled by
`ComponentDataManager`. And since it's a simple single property there was no
need to create a separate `State` instance just for it, a simple setter can do
just fine.

## Rendering (`ComponentRenderer`)

The main reason why anyone would use `Component` is to render something and
give it some behavior. By default, if no element is given to `Component`, an
empty div will be rendered and set to it, as you can see in this
[fiddle](https://jsfiddle.net/metaljs/8r631L1n/).

```js
import Component from 'metal-component';

const component = new Component();
console.log(component.element); // <div></div>
```

As was mentioned [before](../metal-component.md#overview), `Component`'s main
rendering logic is done inside `ComponentRenderer`. To have a component render
more than just an empty div, you need to use a sub class of `ComponentRenderer`
that does something else. Metal.js already provides a few, but let's see what's
needed to create a new one first. Check out this
[fiddle](https://jsfiddle.net/metaljs/yop164h1/).

```js
import { Component, ComponentRenderer } from 'metal-component';

class CustomRenderer extends ComponentRenderer.constructor {
	render(component) {
		component.element = document.createElement('span');
    component.element.textContent = 'Custom content';
    component.informRendered();
  }
}

class MyComponent extends Component {
}
MyComponent.RENDERER = new CustomRenderer();

const component = new MyComponent();
console.log(component.element); // <span>Custom content</span>
```

*[Debug example](../../playground/examples/metal-component/customRenderer.js)*

As you can see we've created a custom renderer by extending from
`ComponentRenderer`, and overriding its `render` function to do what we want.

To tell the truth, we've actually extended from its constructor. This is because
a renderer is a singleton, a single object with functions that can be used by
multiple components. The exported value is actually a class instance, not a
class itself. Custom renderers need to reuse its prototype, so one option is to
extend from its constructor.

Let's take a look at `ComponentRenderer`'s [code](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/ComponentRenderer.js#L7).
As you can see it defines a class, but [exports](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/ComponentRenderer.js#L56)
an instance of it instead of the class itself.

`ComponentRenderer` defines a few methods, but the only one that it actually
implements is `render`, which is what [creates the empty div](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/ComponentRenderer.js#L31)
we've showed. Note that after creating the div, the `informRendered` function is
[called](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/ComponentRenderer.js#L33)
on the component. That's a contract between `Component` and
`ComponentRenderer`. Whenever `ComponentRenderer` finishes rendering a component,
it's informed via `informRendered`, be it on the first time or during an update.
`Component` on the other hand, has to call `ComponentRenderer` functions at the
appropriate time.

One of the things that `Component`'s constructor does is to
[set up its renderer](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L125). This consists of:

1. Detecting the renderer to be used via the `RENDERER` static property, and
storing its reference. Note that `getStaticProperty` is used for this, which
we've seen before when looking at the
[metal module](../metal.md#getstaticproperty).
2. Calling the renderer's `setUp` function.

Still in the constructor, it also [calls](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L136)
a function named `renderComponent`, which [delegates to the renderer](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L463)
via its `render` method.

The constructor also [listens](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L129)
to state changes (which we'll cover in more details later). When a change
happens, it [delegates](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L361)
to the renderer again, [calling](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L598)
the `update` method.

Finally, when a component is disposed, it [calls](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L280)
the renderer's `dispose` method inside `disposeInternal`.

## Data (`ComponentDataManager`)

Another important part of a component is its data, and the ability to configure
and track changes to it. By default, this can be done in a very similar way to
what we've already seen when looking at [State](../metal-state/State.md),
as can be seen in this [fiddle](https://jsfiddle.net/metaljs/vfx1LpxL/).

```js
import Component from 'metal-component';

class MyComponent extends Component {
}
MyComponent.STATE = {
  foo: {
  	setter: val => val + 'bar'
  }
};

const component = new MyComponent({
	foo: 'foo'
});
console.log(component.foo); // 'foobar'
```

This could be accomplished easily by just having `Component` extend from `State`,
or have it be created in the constructor to add properties to the component
instance. It was decided that data management would support customization though,
so `ComponentDataManager` was created to handle that, so that it could be
switched with a sub class in a similar way as renderers can.

Let's take a look at `ComponentDataManager`'s [code](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/ComponentDataManager.js#L17).
Just like `ComponentRenderer` this is also a singleton, so it defines a class
but [exports an instance of it](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/ComponentDataManager.js#L145).

In `Component`'s [constructor](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L126)
the data manager is set up in a similar way to the renderer:

1. Detecting the manager to be used via the `DATA_MANAGER` static property, and
storing its reference. Note that `getStaticProperty` is used again.
2. Calling the manager's `setUp` function. This is [passed](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L532)
configuration for properties that should be present [in every component](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L618) plus some defined by the renderer via its `getExtraDataConfig`
function (which returns nothing by default).

If we look [inside](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/ComponentDataManager.js#L139)
`setUp` we'll see that it first sets a property in the given component. This is
an object that will hold any data needed by the manager. Afterwards it
[calls](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/ComponentDataManager.js#L24)
`createState_`, which (as can be expected) creates a `State` instance to handle
the data. It's passed the object passed to the component's constructor and the
received configuration data plus the one in the component's `STATE` static.
After all's setup, the `State` instance is [stored](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/ComponentDataManager.js#L30)
in the manager's data object.

Whenever the component needs to access some data, it will ask the data manager
for it, since it can't be sure of how it was setup to be accessed.
`ComponentDataManager` provides a few functions to help with that, such as:
[get](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/ComponentDataManager.js#L51), [getStateKeys](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/ComponentDataManager.js#L78), [getState](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/ComponentDataManager.js#L87) and [setState](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/ComponentDataManager.js#L130).

There's one more function from `ComponentDataManager` that is important to know,
called `replaceNonInternal`. This function does almost the same thing as a
`setState` call, but instead of only setting the properties that are listed in
the given object it will set all existing properties that are not marked as
**internal**. Properties can be declared **internal** via its `State`
configuration object, as an extra option, just like `value` and `required`. The
non internal properties that didn't receive any values via `replaceNonInternal`
will be set back [to their default values](https://github.com/metal/metal.js/blob/68005b320d1b8979f910ddae0baaf63b160e7a06/packages/metal-component/src/ComponentDataManager.js#L116).

As was mentioned before, `Component` defines a few properties that should be in
all instances, and which are passed to `ComponentDataManager`. These can be
found in [`Component.Data`](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L618).
Let's check out each of them.

### children

This doesn't have any built-in behavior, but is supposed to be an array with
information about children that should be rendered inside the component.

### elementClasses

This accepts a string with css classes that the renderer should add to the
component's main element.

### events

This can receive an object with information about events to be listened on the
component, as in the following [fiddle](https://jsfiddle.net/metaljs/atyjzqnu/).

```js
import Component from 'metal-component';

const component = new Component({
	events: {
  	event1: function() {
			console.log('Event triggered');    
    }
  }
});
component.emit('event1'); // 'Event triggered'
```

*[Debug example](../../playground/examples/metal-component/events.js)*

In the constructor, components handle this `events` data by calling the
`addListenersFromObj_` function. Note that the value for `events` is accessed
via the manager, via its `get` method.

`addListenersFromObj_` creates an
[`EventHandler`](../metal-events/EventHandler.md) and [adds all attached handles](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L158)
to it. The actual subscriptions are done inside this [`addListenersFromObj`](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/events/events.js#L11)
function. For each event name in the object, it [calls](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/events/events.js#L15) `extractListenerInfo_`, which normalizes the supported formats
into an object with the listener function and a selector (if given). Note that
the listeners can be given in `events` by their names, in which case they're
handled by [`getComponentFn`](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/events/events.js#L57),
which looks for the function reference in the component's instance. After all
this the listeners are [subscribed](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/events/events.js#L18)
via the component's `on` function, or through `delegate` if a selector is given
as well. We'll see more about the component's `delegate` function later.

### visible

This is just a boolean indicating if the component should be visible or not.
It's behavior is automatically handled by `Component`, as you can see in the
this [fiddle](https://jsfiddle.net/metaljs/d9ge0yL3/).

```js
import Component from 'metal-component';

const component = new Component({
	element: '#element',
	visible: false
});
console.log(component.element.style.display); // 'none'
```

`Component` simply sets its element's `display` style to `none` whenever
`visible` is set to `false`, and resets it otherwise, as can be seen
[here](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L578). We'll learn more about `sync` methods later.

## Sync methods

Besides tracking data changes via the events from `State`, which will
automatically be triggered by the component, it's also possible to track them
by just implementing methods with the prefix `sync`. `Component` automatically
calls methods with this name format when data changes. Check out this
[fiddle](https://jsfiddle.net/metaljs/p13djtka/), for example.

```js
import Component from 'metal-component';

class MyComponent extends Component {
	syncFoo(newVal, prevVal) {
  	console.log(newVal, prevVal); // 'newFoo', 'oldFoo'
	}
}
MyComponent.STATE = {
	foo: {
  	value: 'oldFoo'
  }
};

const component = new MyComponent();
component.foo = 'newFoo';
```

These **sync** methods are triggered by `Component` after the first render, and
then after each `stateChanged` batch event from `State`. The first render use
case is done [inside `renderComponent`](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L466),
which we've already seen before. In this case, the function it [calls](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/sync/sync.js#L47),
named `syncState`, finds all **sync** methods and calls them.

The most complicated part here is finding the methods, which is done by
[`getSyncFns_`](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/sync/sync.js#L17).
We could simply look for them every time, but that can take a burden for
performance. Instead, the first time `getSyncFns_` is called it'll ask the
data manager for [all sync keys](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/sync/sync.js#L24).
For the basic `ComponentDataManager` these are all the properties, but other
sub classes can customize this as they wish. Then, for each of these keys the
function will check if the component has a **sync** method for it, storing a
reference when it does. If all found functions are in the component's prototype,
their references are [cached](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/sync/sync.js#L36),
so that calling `getSyncFns_` again will just [return them directly](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/sync/sync.js#L20).
If at least one of the functions is not in the prototype we won't cache anything,
since that means that it may have been bound to the current instance, as in
cases like this:

```js
import Component from 'metal-component';

class MyComponent extends Component {
  syncFoo = () => {}
}
```

## Sync updates (`SYNC_UPDATES`)

`Component` rerenders itself asynchronously after a data change by default,
since it tracks changes via `State`'s `stateChanged` event, which is async.
This is usually fine in most cases, but sometimes it may be important to have
synchronous updates instead, specially to avoid batching. This can be done for
a component by setting its `SYNC_UPDATES` static property to `true`, as in this
[fiddle](https://jsfiddle.net/metaljs/g97yc73h/).

```js
import { Component, ComponentRenderer } from 'metal-component';

let calledUpdate = false;
class CustomRenderer extends ComponentRenderer.constructor {
	update() {
  	calledUpdate = true;
	}
}

class MyComponent extends Component {
}
MyComponent.RENDERER = new CustomRenderer();
MyComponent.SYNC_UPDATES = true;

const component = new MyComponent();
component.visible = false;
console.log(calledUpdate); // true
```

*[Debug example](../../playground/examples/metal-component/syncUpdates.js)*

`Component`'s constructor [sets this up](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L127)
via a call to `setUpSyncUpdates_`. This function does two things:

1. Detects if sync updates should be used, by checking the `SYNC_UPDATES`
static, again using `getStaticProperty` for this.
2. Listens to `stateKeyChanged`, the synchronous event from `State` triggered
after each change.

When `stateKeyChanged` is triggered, the component [calls](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L374)
`updateRenderer_`, which will in turn [call](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L597
the renderer's `update` function, unless the component isn't skipping updates
(can be enabled via `startSkipUpdates`, but more on this later) and hasn't been
rendered yet.

## DOM events proxy

It's possible to listen to DOM events on the component's element by calling
the component's `on` function directly. This is just a helper to reduce
boilerplate, as otherwise you'd need to do something like `this.element.on`
instead, besides having to manually attach and reattach events when the element
changes. This is all done for you by using `on`. Check it out in this
[fiddle](https://jsfiddle.net/metaljs/0Lstdtk9/).

```js
import Component from 'metal-component';

const component = new Component({
	element: '#button'
});
component.on('click', () => alert('Clicked!'));
```

This is done by using `DomEventEmitterProxy`, which we've already learned about
[before](../metal-dom.md#proxy-domeventemitterproxy). It's created in the
component's [constructor](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L82), and whenever the element's value changes, the component
automatically [calls](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L341)
`setOriginEmitter` on it, and everything works as expected without any extra
effort from the developer.

Besides `on`, component also provides a `delegate` function, which automatically
subscribes a delegate listener to its element. Again it just makes use of
`DomEventEmitterProxy` for this, which alreayd has delegate support. The
`delegate` function just [calls](https://github.com/metal/metal.js/blob/12f1bfbdc461550743e91cb0b75317b93e1b4922/packages/metal-component/src/Component.js#L230)
`on` with the expected event name format (**delegate:<eventName>:<selector>**).

## ComponentRegistry

Now let's take a look at: **ComponentRegistry**.

[↪ ComponentRegistry](ComponentRegistry.md)
