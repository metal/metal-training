# Config

`Config` provides a way to build a `State` configuration object via function
calls, instead of manually building the object every time.

## Chainable functions

The functions provided by `Config` can be be chained to build the object
incrementally, as in the following
[fiddle](https://jsfiddle.net/metaljs/ta823nsx/).

```js
import { Config, State } from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: Config.number().value(3).setter(val => val * 2)
};

const state = new MyClass();
console.log(state.foo); // 6
```

Looking at the [code](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/Config.js#L29)
you can see that all functions in `Config` call a certain `mergeConfig` with the
configuration object to be used. That's important because calls to `Config` can
be chained to build a full configuration, as in `Config.value(1).required()` for
example. Each function in `Config` returns an object that has not only the built
config but also all the functions again, so they can be called to enhance it.

That's exactly what `mergeConfig` does. First it checks if the object calling it
(passed via its [first arg](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/Config.js#L73))
is the `Config` singleton, which is what happens on the first call to these
functions. In that case `mergeConfig` will [create a new object](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/Config.js#L76)
using `Config` as the prototype and set a `config` variable in it. When the
caller isn't `Config` that means that it's an object that was created from it,
like the one we've just showed, and so it's reused as it is. Then `mergeConfig` [merges](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/Config.js#L79)
the new config with the one that object holds.

Note that the result isn't the configuration object `State` usually expects,
it's inside a `config` key instead. We didn't show it when looking at the
`State` code, but this format is actually supported too, as can be seen
[here](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/State.js#L258).
Basically, when a config object has a `config` key, the content inside that will
replace it. That's why the return values from `Config` functions work.

## Validator functions

There are only [four functions](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/Config.js#L29)
defined directly inside `Config`: `required`, `setter`, `validator` and `value`.
If you try to print all keys inside it (like
`console.log(Object.keys(Config));`) you'll see that it has many more though.
These others all match the same names of the functions inside `validators`.
That's because they're [added dynamically](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/Config.js#L84)
from its contents, so that everything included there is also supported by
`Config`. Each validator is wrapped in `Config.validator` [call](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/Config.js#L87).

## Next steps

We're done with **metal-state**, so time to go to **metal-component**.

[↪ Package: metal-component](../metal-component.md)
