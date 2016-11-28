# EventEmitter

`EventEmitter` is a class that can handle emitting and subscribing to events. It
can be instantiated directly, or extended to provide this functionality to other
classes.

## Subscribing (`on`)

The main functionality of `EventEmitter` is simply subscribing to an object's
events. This can be done either via the `on` or the `addListener` function. Both
names are supported because they're two known patterns, but they work exactly
the same way, so developers can use the one they prefer. This
[fiddle](https://jsfiddle.net/metaljs/dgq5ucyz/) shows a simple usage example.

```js
const emitter = new EventEmitter();

// The calls below are identical.
emitter.on('myEvent', listener);
emitter.addListener('myEvent', listener);
```

*[Debug example](../../../playground/examples/EventEmitter/on.js)*

Since both functions work the same way, `addListener` is the one that contains
the relevant code, and `on` simply calls it, as you can see [here](https://github.com/metal/metal.js/blob/2a6bb0014cfa729a16ec040cfaf93660871dd567/packages/metal-events/src/EventEmitter.js#L280).

Let's focus on [addListener](https://github.com/metal/metal.js/blob/2a6bb0014cfa729a16ec040cfaf93660871dd567/packages/metal-events/src/EventEmitter.js#L71)
then. You can see that it accepts up to three arguments, but for now let's just
focus on the first two.

As you can see from the code, this functions basically does only three things:

1. Checks if the listener is valid (i.e. a function).
2. Loops through the given events (yes, it can receive an array of events
instead of a single one at a time) and attaches the listener to each of them
via `addSingleListener_`.
3. Returns an `EventHandle` instance. More on that [later](EventHandle.md).

If we go [inside addSingleListener_](https://github.com/metal/metal.js/blob/2a6bb0014cfa729a16ec040cfaf93660871dd567/packages/metal-events/src/EventEmitter.js#L94)
now, we'll see that it's more generic and complicated. For now we'll ignore
most of it and just notice that it stores the listener in an object, keyed by
event name, as you can see [here](https://github.com/metal/metal.js/blob/2a6bb0014cfa729a16ec040cfaf93660871dd567/packages/metal-events/src/EventEmitter.js#L104). For now, just assume that's it's simply pushing the listener into
an array for that event (that's what [really happens](https://github.com/metal/metal.js/blob/2a6bb0014cfa729a16ec040cfaf93660871dd567/packages/metal-events/src/EventEmitter.js#L57)
most of the times anyway).

## Emitting (`emit`)

Now that we have an idea of how subscribing is done, we need to understand how
the event actually triggers these subscribed listeners. That happens when the
`emit` function is called. Take a look at the rest of the [fiddle]([fiddle](https://jsfiddle.net/metaljs/dgq5ucyz/))
from the last section now.

```js
const calls = [];
const listener = (...args) => calls.push(args);
const emitter = new EventEmitter();

// Let's subscribe to an event named "myEvent".
emitter.on('myEvent', listener);

// Same name, triggers the listener.
emitter.emit('myEvent');
// Different name, won't trigger the listener.
emitter.emit('notMyEvent');
// Same name, triggers the listener.
emitter.emit('myEvent', 'foo', 'bar');

console.log(calls); // [ [], [ "foo", "bar" ] ]
```

As you can see, whenever `emit` is called for a given event name, the listeners
subscribed to it will run. `emit` can receive any number of arguments after the
event name, which will all be passed over to the triggered listeners.

*[Debug example](../../../playground/examples/EventEmitter/emit.js)*

As you can see from its [code](https://github.com/metal/metal.js/blob/c49fa217ca4712063fe30d96cf6e46ec23a4dcf2/packages/metal-events/src/EventEmitter.js#L140),
`emit` works the following way:

1. Gets the array of listeners for the emitted event.
2. If there are no subscribed listeners, bails out and returns `false`.
3. Otherwise runs the listeners via [runListeners_](https://github.com/metal/metal.js/blob/c49fa217ca4712063fe30d96cf6e46ec23a4dcf2/packages/metal-events/src/EventEmitter.js#L378),
passing it the received arguments, and returns `true`.

That's it for these basic features. Of course there's also some more code in
there that handles things related to [default listeners](#default-listeners) and
[facade](#facade-setshouldusefacade), but we'll get to those later.

## Unsubscribing (`off`)

What if you want to stop listening to a previously subscribed event? Well you
can do that via the `off` or the `removeListener` functions. Both work the same
way. Check this [fiddle](https://jsfiddle.net/metaljs/fcmtkdhh/) example.

```js
let callsCount1 = 0;
const listener1 = () => callsCount1++;
let callsCount2 = 0;
const listener2 = () => callsCount2++;
const emitter = new EventEmitter();

// Let's subscribe two listeners to an event named "myEvent".
emitter.on('myEvent', listener1);
emitter.on('myEvent', listener2);

// And now we'll unsubscribe the first one from it.
emitter.off('myEvent', listener1);

// Will only trigger the second listener.
emitter.emit('myEvent');
console.log(callsCount1, callsCount2); // 0, 1
```

*[Debug example](../../../playground/examples/EventEmitter/off.js)*

The implementation for this is pretty straightforward. You can see [here](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L343)
that `removeListener` simply calls the `off` function, since they do the same
thing.

`off` simply loops through the listeners of the requested event name
(or names, since you can also pass an array here, as to `on`), removing the ones
that match the given listener. The function that checks if the listener matches
is `matchesListener_`. You can see that it does so by just checking if the
functions are [exactly the same](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L238).
There's also another check, but that will only be needed after we learn about
the other kinds of subscription methods in the next section.

There's also another function that can be used for unsubscribing to all
listeners at once, called `removeAllListeners`. Check it out in this
[fiddle](https://jsfiddle.net/metaljs/963yd268/). It can also be used to
unsubscribe to all listeners for specific event names, instead of for all of
them, by passing them to the function, like in this other
[fiddle](https://jsfiddle.net/metaljs/mxeexh25/). This one is even more
straightforward, its [code](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L303)
just removes all stored listeners for the requested events.

## Other subscription methods (`once`, `many`)

There are times when the developer wants to listen to an event a fixed number
of times. They can track this and unsubscribe to the event themselves, but
`EventEmitter` provides an easy way to do this via the function called `many`.
Take a look at this [fiddle](https://jsfiddle.net/metaljs/gqmc22uv/).

```js
let callsCount = 0;
const listener = () => callsCount++;
const emitter = new EventEmitter();

// Let's subscribe a listener to trigger at most two times.
emitter.many('myEvent', 2, listener);

// Only the first two calls will trigger the listener.
emitter.emit('myEvent');
emitter.emit('myEvent');
emitter.emit('myEvent');
emitter.emit('myEvent');
console.log(callsCount); // 2
```

*[Debug example](../../../playground/examples/EventEmitter/many.js)*

So how does it work? Looking at `many`'s [code](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L192)
you'll see that it just loops through the event names, but the real job is done
by another function: `many_`.

What that does is just to wrap the given listener in another that unsubscribes
itself when triggered the requested number of times, and then
[pass that as the listener instead](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L225)
to that `addSingleListener_` function we've already seen before.

Note that the original listener is also passed to `addSingleListener_` as the
fourth argument though, called `opt_origin`. When that happens,
`addSingleListener_` [stores an object](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L97)
instead of just the listener in the event's array. This object has references
to both the original function and the wrapper built by `many_`.

And why is that
important at all? If you look up `origin` you'll see that it's only used inside
`matchesListener_`'s [code](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L239),
when unsubscribing from the event. That's because we need to allow the developer
to unsubscribe using the original function he's passed to `EventEmitter`, as
he/she doesn't know about our internal wrapper, which is the actual listener
being triggered. Time for another
[fiddle](https://jsfiddle.net/metaljs/3erLc60L/).

```js
let callsCount = 0;
const listener = () => callsCount++;
const emitter = new EventEmitter();

// Let's subscribe a listener to trigger at most two times.
emitter.many('myEvent', 2, listener);
// And then unsubscribe it.
emitter.off('myEvent', listener);

// No calls will trigger the listener.
emitter.emit('myEvent');
emitter.emit('myEvent');
console.log(callsCount); // 0
```

To accomplish this `matchesListener_` checks if either the listener or its
`origin` match the function to be unsubscribed.

`EventEmitter` also provides a similar helper function called `once`, which just
calls `many` with `1` as the amount, as can be seen [here](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L293).

## Tracking listeners (`onListener`)

What if someone needs to be notified whenever a listener is subscribed? This
can be done via `EventEmitter`'s  `onListener` function, as on this
[fiddle](https://jsfiddle.net/metaljs/31grgezb/).

```js
const calls = [];
const listener = (eventName) => calls.push(eventName);
const emitter = new EventEmitter();

// Let's subscribe to listener subscriptions.
emitter.onListener(listener);
emitter.on('myEvent', () => {});
emitter.on('myEvent2', () => {});
console.log(calls); // ['myEvent', 'myEvent2']
```

*[Debug example](../../../playground/examples/EventEmitter/onListener.js)*

When `onListener` is called, it [stores](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L282)
the given callback function. When new listeners are subscribed, these special
callbacks will be triggered [inside addSingleListener_](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L95)
by the function called `runListenerHandlers_`, which just [calls all of them](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L356).

## Facade (`setShouldUseFacade`)

By default no information about the event being triggered is passed to the
listeners. `EventEmitter` can be setup to pass them a facade object with data
by calling the `setShouldUseFacade` method, like in this
[fiddle](https://jsfiddle.net/metaljs/uxh9tqfj/).

```js
const calls = [];
const listener = (...args) => calls.push(args);
const emitter = new EventEmitter();

// The emitter will now pass an object to listeners
// with data about the event, as the last arg.
emitter.setShouldUseFacade(true);

// Let's subscribe to an event named "myEvent".
emitter.on('myEvent', listener);

// Same name, triggers the listener.
emitter.emit('myEvent', 'foo', 'bar');

console.log(calls[0]);
// ['foo', 'bar', {target: emitter, type: 'myEvent'}]
```

*[Debug example](../../../playground/examples/EventEmitter/facade.js)*

The `setShouldUseFacade` function itself just
[stores the value it receives](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L397).
The important code for this feature lives inside `emit`, when deciding what to
pass the triggered listeners. The function named `buildFacade_`
[called by emit](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L147)
is the one that [creates the object](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L115).
It's then passed down to `runListeners_`, which [adds it](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L370)
to the list of arguments that will be given to the listener.

## Default listeners

Native dom events allow developers to prevent default behaviors related to them,
via a function named `preventDefault`. Similarly, `EventEmitter` provides a way
for users to define a default listener, meaning that it will only run after all
non default listeners, and only if the `preventDefault` function passed to them
via the facade isn't called (note that `setShouldUseFacade` needs to be set
to true for this function to be available). Check out this
[fiddle](https://jsfiddle.net/metaljs/t4934n1f/).

```js
let str = 'foo';
const emitter = new EventEmitter();
emitter.setShouldUseFacade(true);

// Subscribed as "default" listener. Will be called last.
emitter.on('myEvent', () => str += '-last', true);
emitter.on('myEvent', () => str += '-first');

emitter.emit('myEvent');
console.log(str); // 'foo-first-last'

// This new listener will prevent the default listener from running.
emitter.on('myEvent', (event) => event.preventDefault());
str = 'foo';
emitter.emit('myEvent');
console.log(str); // 'foo-first'
```

*[Debug example](../../../playground/examples/EventEmitter/default.js)*

When a listener is subscribed as default, this flag will be stored together with
it in the array of listeners, as you can see [here](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L98).

When an event is emitted, all default listeners are [skipped](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L377)
until all other listeners finish running. Then, unless `preventDefault` has been
called, the default handlers [are run too](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L382).

The `preventDefault` function is added to the facade when that's built, and just
keeps track via a [flag](https://github.com/metal/metal.js/blob/071280367a2c6f98bdafeeb30d151f4b61cb8a5a/packages/metal-events/src/EventEmitter.js#L116)
of if it's been called.

## Performance / memory optimizations

## EventHandle

Now let's take a look at: **EventHandle**.

[↪ EventHandle](EventHandle.md)
