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

![Emitting](../../../diagrams/EventEmitterProxy-emitting.png)

The listener subscribed by the proxy to the origin emitter is `emitOnTarget_`,
which just [emits the event on the target](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/EventEmitterProxy.js#L98).

## Blacklist / Whitelist

What if you want events to be proxied, but with a few exceptions? You can
pass a blacklist of event names to `EventEmitterProxy`, like on this
[fiddle](https://jsfiddle.net/metaljs/5cqLkgyo).

And what of the opposite? You can pass a whitelist of event names to
`EventEmitterProxy`, like on this
[fiddle](https://jsfiddle.net/metaljs/yh61cqzx/), and it will proxy only those
events.

Both the blacklist and the whitelist are implemented inside `shouldProxyEvent_`,
checking if the proxied event [matches the maps](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/EventEmitterProxy.js#L150).

## Changing the origin emitter

`EventEmitterProxy` allows changing the origin emitter at any time via the
function `setOriginEmitter`. You can see from its [code](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/EventEmitterProxy.js#L132)
that when this happens it will remove any existing listeners from the previous
origin and automatically subscribe them to the new one instead.

It's possible for the origin to be set to `null` for a while. In this case the
event types listened on the target will be [stored temporarily](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/EventEmitterProxy.js#L182),
until an origin is set again, in which case they'll be properly linked to it.

## Next steps

We're done with **metal-events**, so time to go to **metal-dom**.

[↪ Package: metal-dom](../metal-dom.md)
