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

Most of the exported functions are very straightforward, doing simple type
checks or handling common functionalities such as comparing arrays. Here we'll
focus on the more complex and important ones. The others are simple enough to
understand just by reading the code.

### collectSuperClassesProperty

This receives a class and a property name, returning an array with the values
for that static property in the given class and in all of its ancestors. Check
out this [fiddle](https://jsfiddle.net/metaljs/3gLkgtmz/) example.

<script async src="//jsfiddle.net/metaljs/3gLkgtmz/embed/"></script>

```js
class GrandParent {}
GrandParent.STATIC_PROP = 1;

class Parent extends GrandParent {}
Parent.STATIC_PROP = 2;

class Main extends Parent {}
Main.STATIC_PROP = 3;

collectSuperClassesProperty(Main, 'STATIC_PROP'); // [1]
collectSuperClassesProperty(Parent, 'STATIC_PROP'); // [2, 1]
collectSuperClassesProperty(GrandParent, 'STATIC_PROP'); // [3, 2, 1]
```

This is done via a loop that goes up the hierarchy by checking the current
class' `__proto__` property, which is where browsers store a reference to
the super class. The loop ends when the super class is `Function`, which
indicates that we've reached the root. For each class that's reached, its value
for the requested property is stored in an array, which is returned at the end.
You can check the code [here](https://github.com/metal/metal.js/blob/fc222c16fec43b4a5ed6a8ae8339247a4c3ca16c/packages/metal/src/coreNamed.js#L47).

While on its own this function may not be very useful, it's used directly by
`mergeSuperClassesProperty`, an important function that will be explained next.

### mergeSuperClassesProperty

This is similar to `collectSuperClassesProperty`, receiving a class and property
name as well, but instead of just collecting the property's values this function
merges them all into one by using the function received as its third argument.

In the end, the merged value is stored in a new property of the given class, so
the whole calculation can be skipped if the function is called again. The name
of the new property is the original name plus the suffix `_MERGED`.

This function will return `true` if the value was merged for the first time, or
`false` if it was reused from a previous call. Check out this
[fiddle](https://jsfiddle.net/metaljs/2dcmzswu/) example.

```js
class GrandParent {}
GrandParent.STATIC_PROP = 1;

class Parent extends GrandParent {}
Parent.STATIC_PROP = 2;

class Main extends Parent {}
Main.STATIC_PROP = 3;

const addAll = arr => arr.reduce((a, b) => a + b);
mergeSuperClassesProperty(Main, 'STATIC_PROP', addAll);
mergeSuperClassesProperty(Parent, 'STATIC_PROP', addAll);
mergeSuperClassesProperty(GrandParent, 'STATIC_PROP', addAll);

Main.STATIC_PROP_MERGED; // 6
Parent.STATIC_PROP_MERGED; // 3
GrandParent.STATIC_PROP_MERGED; // 1
```

Note that `collectSuperClassesProperty` is [used internally](https://github.com/metal/metal.js/blob/fc222c16fec43b4a5ed6a8ae8339247a4c3ca16c/packages/metal/src/coreNamed.js#L272) to get the property values that should be merged.

### Compatibility Mode
