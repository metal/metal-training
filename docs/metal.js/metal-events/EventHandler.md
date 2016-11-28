# EventHandler

This class can be used to collect multiple `EventHandle` objects, and later
remove all of them with a single call. Check out this
[fiddle](https://jsfiddle.net/metaljs/h73dybwx/).

```js
let callsCount = 0;
const listener = () => callsCount++;
const emitter = new EventEmitter();
const handler = new EventHandler();

handler.add(
  emitter.on('myEvent', listener),
  emitter.on('myEvent2', listener)
);

// Unsubscribes all listeners.
handler.removeAllListeners();

// Won't trigger listeners, since they were unsubscribed.
emitter.emit('myEvent');
emitter.emit('myEvent2');
console.log(callsCount); // 0
```

As can be imagined, this is done by just looping through all the received
handles, and calling their `removeListener` function, as can be seen
[here](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/EventHandler.js#L48).

## EventEmitterProxy

Now let's take a look at: **EventEmitterProxy**.

[↪ EventEmitterProxy](EventEmitterProxy.md)
