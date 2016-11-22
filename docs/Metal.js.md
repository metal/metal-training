# Metal.js

Before starting make sure to clone the [metal/metal.js](https://github.com/metal/metal.js) repo and follow its [setup instructions](https://github.com/metal/metal.js#setup).

## Monorepo organization (Lerna)

This repository contains multiple packages, which are considered the core modules. They're published separately in npm, as developers are not required to use all of them on their projects. There's a lot of communication between them though, and new features or even improvements often require changes on more than one of these modules, which is hard to do and test when code is split into separate repos.

That's why we've decided to use [LernaJS](https://lernajs.io/) to manage the
repo. It's perfect for this use case and it's been used by
[projects like Babel and React](https://lernajs.io/#users).

## Packages

The main repo currently has eight packages:

* [metal](metal.js/metal.md) - Utility functions.
* [metal-events](metal.js/metal-events.md) - Custom event handling.
* [metal-dom](metal.js/metal-dom.md) - DOM related utilities.
* [metal-state](metal.js/metal-state.md) - Data configuration and tracking.
* [metal-component](metal.js/metal-component.md) - Basic component structure.
* [metal-incremental-dom](metal.js/metal-incremental-dom.md) - Integration with incremental dom.
* [metal-soy](metal.js/metal-soy.md) - Integration with soy templates.
* [metal-jsx](metal.js/metal-jsx.md) - Integration with JSX templates.

The diagram below represents the relations between them. You can see for example that **metal** is the most low level package, while **metal-jsx** and **metal-soy** are both built on top of the incremental dom integration:

![Packages](../diagrams/repos.png)

Each package has its own package.json and is set up so that it provides two
types of entry points: one for commonjs usage (**main**) and another for ES6
modules (**jsnext:main**). Check out metal-dom's
[package.json](packages/metal-dom/package.json#L11) file as an example.

## Contributing

For detailed information about the workflow used to develop for Metal.js (like building and testing), as well as contribution requirements, check out the [guidelines document](https://github.com/metal/metal.js/blob/master/CONTRIBUTING.md).

## Next steps

Let's start actually looking at the code now. We'll begin with the most simple package: **metal**.

[↪ Package: metal](metal.js/metal.md)
