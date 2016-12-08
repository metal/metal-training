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

## Overview

`Component` is the main class inside **metal-component**, the only one used by
Metal.js developers in most cases. Its most important features, rendering and
managing data, are not implemented directly inside it though. `Component` was
built to be flexible about these, so that it can be customized to support
multiple template languages and ways of accessing data. That's why these
features are delegated to `ComponentRenderer` and `ComponentDataManager.`.

![Component](../../diagrams/Component.png)

`ComponentRegistry` on the other hand is just a utility that's not directly
used by the other three, but can be helpful when building sub classes of
`ComponentRenderer` for example.

Let's see this in more details now.

[↪ Component](metal-component/Component.md)
