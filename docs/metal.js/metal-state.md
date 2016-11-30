# metal-state

The [metal-state](https://github.com/metal/metal.js/tree/master/packages/metal-state)
package provides utilities that help configure object properties and track
changes to their values.

## Usage

To use it, first install **metal-state** through npm, like this:
```sh
[sudo] npm install metal-state
```

Then you'll be able to import its contents in your ES6 modules. For example:

```js
import { State } from 'metal-state';
```

## Exported values

These are all the values exported by **metal-state**:

```js
import {
  Config,
  State,
  validators
} from 'metal-state';

// `State` can also be included via a default import.
import State from 'metal-state';
```

The entry file is
[packages/metal-state/src/all/state.js](https://github.com/metal/metal.js/blob/master/packages/metal-state/src/all/state.js).

`State` is the most important of the three, so we'll start with it.

[↪ State](metal-state/State.md)
