# EventEmitterProxy

`EventEmitterProxy` allows subscribing on an emitter for events that are
triggered by another.

## Proxy

Let's say that for some reason you'd like to have all the events from a certain
origin emitter be automatically emitted by another as well. In other words,
you'd like to listen to them on this target emitter, even though they're being
triggered by another (the origin). This
[fiddle](https://jsfiddle.net/metaljs/4mcg9rdw/) shows how it'd be.

```js
const origin = new EventEmitter();
const target = new EventEmitter();

// This will proxy all events from origin to target.
const proxy = new EventEmitterProxy(origin, target);

let callsCount = 0;
// Listening on the target.
target.on('myEvent', () => callsCount++);

// Triggering on the origin.
origin.emit('myEvent');
console.log(callsCount); // 1
```

*[Debug example](../../../playground/examples/EventEmitter/proxy.js)*

`EventEmitterProxy` makes this all work by listening to any event subscriptions
on the target emitter via `onListener`, which we've
[learned about](../EventEmitter.md#tracking-listeners-onlistener) when studying
`EventEmitter`'s code. This is done right in the [constructor](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/EventEmitterProxy.js#L69),
which calls a function called `startProxy_`, which in turn does the [onListener](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/EventEmitterProxy.js#L164)
subscription.

After the proxy is setup so, whenever a listener is subscribed to the target
emitter, the following flow will run:

![Subscribing](../../../diagrams/EventEmitterProxy-subscribing.png)

Basically, calling `on` on the target triggers the listener function we've setup
via `onListener_`, called `proxyEvent`. Unless this event type has already been
handled before, failing the `shouldProxyEvent_` [call](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/EventEmitterProxy.js#L106)
(ignore the whitelist/blacklist references inside it, we'll get there later),
`EventEmitterProxy` will [subscribe to it on the origin emitter](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/EventEmitterProxy.js#L176)
via `on`.

Now whenever that event type is emitted by the origin, `EventEmitterProxy` will
know that it should emit it at the target as well.

![Subscribing](../../../diagrams/EventEmitterProxy-emitting.png)

The listener subscribed by the proxy to the origin emitter is `emitOnTarget_`,
which just [emits the event on the target](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/EventEmitterProxy.js#L98).

## Next steps

We're done with **metal-events**, so time to go to **metal-dom**.

[↪ Package: metal-dom](../metal-dom.md)
