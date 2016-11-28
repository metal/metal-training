# EventHandle

This class is used internally by `EventEmitter` to provide an easier way of
unsubscribing to events. Normally you'd need to directly call `off` with both
the event name and the listener that was subscribed to it. That can be annoying,
since you have to store this information somewhere to make unsubscribe later.

Fortunately, all functions for subscribing to events return an instance of
`EventHandle`. To unsubscribe you can just call the `removeListener` function
from this instance instead, as in this
[fiddle](https://jsfiddle.net/metaljs/gcb89q7u/).

```js
let callsCount = 0;
const listener = () => callsCount++;
const emitter = new EventEmitter();
const handle = emitter.on('myEvent', listener);

// Unsubscribes the listener.
handle.removeListener();

// Won't trigger listener, since it was unsubscribed.
emitter.emit('myEvent');
console.log(callsCount); // 0
```

You can see that this instance is created and returned automatically by
`EventEmitter` in subscription functions like
[addListener](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/EventEmitter.js#L79)
and [many](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/EventEmitter.js#L198).

`EventHandle`'s [code](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/EventHandle.js#L58)
is pretty straightforward, it just calls the `removeListener` function for the
user.

## EventHandler

Now let's take a look at: **EventHandler**.

[↪ EventHandler](EventHandler.md)
