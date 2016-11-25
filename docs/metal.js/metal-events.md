# metal-events

The [metal-events](https://github.com/metal/metal.js/tree/master/packages/metal-events)
package contains Metal.js' implementation of `EventEmitter`, providing an
interface for objects to subscribe and emit events to each other.

## Usage

To use it, first install **metal-events** through npm, like this:
```sh
[sudo] npm install metal-events
```

Then you'll be able to import its contents in your ES6 modules. For example:

```js
import { EventEmitter } from 'metal';
```

## Exported values

These are all the values exported by **metal-events**:

```js
import {
  EventEmitter,
  EventEmitterProxy,
  EventHandle,
  EventHandler
} from 'metal-events';

// The EventEmitter can also be included via a default import.
import EventEmitter from 'metal-events';
```

The entry file is
[packages/metal-events/src/events.js](https://github.com/metal/metal.js/blob/master/packages/metal-events/src/events.js)

You can see that besides the emitter there are also a few others helpers. We'll
talk about all of them here, but let's first start with **EventEmitter** itself.

[↪ EventEmitter](metal-events/EventEmitter.md)
