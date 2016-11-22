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

This receives a class and a property name, and returns an array with the values
for that static property in the given class and in all of its ancestors. Check
out this [fiddle]() example.

This is done via a loop that goes up to ancestors by checking the current
class' `__proto__` property, which is where browsers store a reference to
the super class. The loop ends when the super class is `Function`, which
indicates that we've reached the root. For each class we reach, we store the
value of the requested property in an array, and return it at the end. You can
check the code [here](https://github.com/metal/metal.js/blob/fc222c16fec43b4a5ed6a8ae8339247a4c3ca16c/packages/metal/src/coreNamed.js#L47).

### mergeSuperClassesProperty



### Compatibility Mode
