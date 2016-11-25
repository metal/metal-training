# metal

The [metal](https://github.com/metal/metal.js/tree/master/packages/metal)
package just contains some utility functions that are frequently useful in a
Metal.js project.

## Usage

To use it, first install **metal** through npm, like this:
```sh
[sudo] npm install metal
```

Then you'll be able to import its contents in your ES6 modules. For example:

```js
import {isString, isFunction} from 'metal';
```

## Exported values

At the time this document was created, **metal** exported 30 variables for the
developer. If you wish, you can quickly see a list of all the current exports by
doing something like this:

```js
import * as metal from 'metal';
console.log(Object.keys(metal));
```

You can also check what this module exports by looking at its entry file's code,
which is located at
[packages/metal/src/metal.js](https://github.com/metal/metal.js/blob/master/packages/metal/src/metal.js),
as can be seen in its [package.json](https://github.com/metal/metal.js/blob/master/packages/metal/package.json#L16).

Most of the exported functions are very straightforward, doing simple type
checks or handling common functionalities such as comparing arrays. Here we'll
focus on the more complex and important ones. The others are simple enough to
understand just by reading the code.

### getStaticProperty

This [function](https://github.com/metal/metal.js/blob/3edfe6d8e1735c249a31d1dd0af46aacd2121fda/packages/metal/src/coreNamed.js#L120)
returns a static property's value for a given class, taking the values from
super classes into account. Some browsers already handle this automatically,
inheriting static properties. This function is useful to support this kind of
functionality in all browsers. Check out this
[fiddle](https://jsfiddle.net/metaljs/jbofym7e/) example.

```js
class GrandParent {}
GrandParent.STATIC_PROP = 1;

class Parent extends GrandParent {}
Parent.STATIC_PROP = 2;

class Main extends Parent {}

getStaticProperty(Main, 'STATIC_PROP'); // 2
getStaticProperty(Parent, 'STATIC_PROP'); // 2
getStaticProperty(GrandParent, 'STATIC_PROP'); // 1
```

If you check the code you'll see that this function also accepts a function as
its third (optional) argument. When one is passed, the property value won't be
simply inherited, but merged according to that function instead. Check out this
[fiddle](https://jsfiddle.net/metaljs/b9q5LL7z/) example.

```js
class GrandParent {}
GrandParent.STATIC_PROP = 1;

class Parent extends GrandParent {}
Parent.STATIC_PROP = 2;

class Main extends Parent {}
Main.STATIC_PROP = 3;

const add = (a, b) => a + b;
getStaticProperty(Main, 'STATIC_PROP', add); // 6
getStaticProperty(Parent, 'STATIC_PROP', add); // 3
getStaticProperty(GrandParent, 'STATIC_PROP', add); // 1
```

This is done via a recursion that goes up the hierarchy by checking the current
class' `__proto__` property, which is where browsers store a reference to
the super class. The recursion ends when the super class is `Function`, which
indicates that we've reached the root. You can check the code [here](https://github.com/metal/metal.js/blob/3edfe6d8e1735c249a31d1dd0af46aacd2121fda/packages/metal/src/coreNamed.js#L120).

When calculated, the property's final value is stored as a new property of the
given class, so the whole calculation can be skipped if the function is called
again. The name of the new property is the original name plus the suffix
`_MERGED`.

### Compatibility Mode

Some breaking changes were introduced when Metal major versions (1.x and 2.x)
were released, and others may be done on upcoming versions too. These can be
hard to handle when upgrading Metal.js code, specially in cases where there's
not much control over the whole codebase that may be affected by the changes.

To help with these use cases, Metal.js provides a compatibility mode, where some
features that may have changed, or even removed, can work like before. This mode
can be turned on via the `enableCompatibilityMode` function.

```
enableCompatibilityMode(); // that's all you need
```

The features that are affected by this call are detailed in the function's [doc description](https://github.com/metal/metal.js/blob/3edfe6d8e1735c249a31d1dd0af46aacd2121fda/packages/metal/src/coreNamed.js#L46).

If you look at the
[code](https://github.com/metal/metal.js/blob/3edfe6d8e1735c249a31d1dd0af46aacd2121fda/packages/metal/src/coreNamed.js#L46)
you'll notice that this function can receive an optional argument. This should
be an object with data for configuring compatibility mode features, if needed.
Again, supported configurations are detailed in the function's [doc description](https://github.com/metal/metal.js/blob/3edfe6d8e1735c249a31d1dd0af46aacd2121fda/packages/metal/src/coreNamed.js#L55).

Note that though the function for enabling this mode is available in the
**metal** package, the actual logic for reactivating each supported feature will
live in the package where it belongs to. The usage of `keys` instead of `refs`
in incremental dom components, for example, is implemented inside the
**metal-incremental-dom** package, which uses the `getCompatibilityModeData`
function from **metal** to determine if the mode is enabled. Check it out
[here](https://github.com/metal/metal.js/blob/2c50c73cdddc97c2a34c93abe2e06997bd6b6456/packages/metal-incremental-dom/src/IncrementalDomRenderer.js#L283).
