# metal-component

The [metal-component](https://github.com/metal/metal.js/tree/master/packages/metal-component)
package provides the `Component` class, which collects common behaviors to be
followed by UI components, such as Lifecycle, CSS classes management, events
encapsulation and support for different types of rendering

## Usage

To use it, first install **metal-component** through npm, like this:
```sh
[sudo] npm install metal-component
```

Then you'll be able to import its contents in your ES6 modules. For example:

```js
import { Component } from 'metal-component';
```

## Exported values

These are all the values exported by **metal-component**:

```js
import {
  Component,
  ComponentDataManager,
  ComponentRegistry,
  ComponentRenderer
} from 'metal-component';

// `Component` can also be included via a default import.
import Component from 'metal-component';
```

The entry file is
[packages/metal-component/src/all/component.js](https://github.com/metal/metal.js/blob/master/packages/metal-component/src/all/component.js).

`Component` is the most important of the three, so we'll start with it.

[↪ Component](metal-component/Component.md)
