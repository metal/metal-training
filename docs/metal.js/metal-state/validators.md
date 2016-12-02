# validators

This is another variable exported by **metal-events**. It just contains some
useful validators that can be used when configuring properties via `State`.
We'll see all of them here.

## `validators.any`

This validator will allow any values through. Though not very useful on its own,
it can be helpful when composed with others like [shapeOf](#validatorsshapeof).
Check it out in this [fiddle](https://jsfiddle.net/metaljs/02p15ybj/).

```js
import { State, validators } from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  	validator: validators.any()
  }
};

const state = new MyClass();

// No errors are triggered.
state.foo = 1;
state.foo = '2';
```

Looking at the [code](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L18)
we can see that this function just returns another that always returns true,
so that the validator always passes.

## `validators.array`

This will check if the value is an array (or null/undefined, these two are
accepted by all validators here). Check it out in this
[fiddle](https://jsfiddle.net/metaljs/gmz2cw5n/).

```js
import { State, validators } from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  	validator: validators.array()
  }
};

const state = new MyClass();

// Error is triggered.
state.foo = 1;
```

*[Debug example](../../../playground/examples/metal-state/validators-array.js)*

This validator is created by a function named `buildTypeValidator` as can be
seen [here](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L19). `buildTypeValidator` receives string representing the type to validate
against and returns the function that `validators.array` will be set to.

To do this it [calls](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L158)
`maybe`, which returns a function that accepts null/undefined values and runs
another validator when that's not the case. Here, `validateType` is passed to it
for the actual type check. When the type doesn't match, this function returns
an [error](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L248).

## `validators.bool`

This will check if the value is boolean. It works exactly the same way as
`validators.array`.

## `validators.func`

This will check if the value is a function. It works exactly the same way as
`validators.array`.

## `validators.number`

This will check if the value is a number. It works exactly the same way as
`validators.array`.

## `validators.object`

This will check if the value is an object. It works exactly the same way as
`validators.array`.

## `validators.string`

This will check if the value is a string. It works exactly the same way as
`validators.array`.

## `validators.arrayOf`

This validator is a bit different than the previous ones. It not only checks
if the value is an array, but also that all its items match a certain type.
Check it out in this [fiddle](https://jsfiddle.net/metaljs/e9fjLwt6/).

```js
import { State, validators } from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  	validator: validators.arrayOf(validators.number)
  }
};

const state = new MyClass();

// This is OK, no error is triggered.
state.foo = [1, 2, 3];

// This triggers an error.
state.foo = [1, '2', 3];
```

*[Debug example](../../../playground/examples/metal-state/validators-arrayOf.js)*

First this validator [checks](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L34)
if the value is an array. If so, it will run `validateArrayItems`, which loops
through the array's items running the given validator. If any of the items
fail, an [error](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L230)
is returned.

## `validators.instanceOf`

This will check if the value is an instance of a given class, as in this
[fiddle](https://jsfiddle.net/metaljs/e9fjLwt6/).

```js
import { State, validators } from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  	validator: validators.instanceOf(State)
  }
};

const state = new MyClass();

// This is OK, no error is triggered.
state.foo = new State();

// This triggers an error.
state.foo = 1;
```

*[Debug example](../../../playground/examples/metal-state/validators-instanceOf.js)*

The implementation for this is pretty straightforward. It uses `instanceof` to
validate the value, as you can see [here](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L49).

## `validators.objectOf`

This validator is similar to `validators.arrayOf`, but for objects. It not only
checks that the value is an object, but also that all its values pass the given
validator.

## `validators.oneOf`

This checks if the value is one of the given values, like in this
[fiddle](https://jsfiddle.net/metaljs/q4xdjbec/).

```js
import { State, validators } from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  	validator: validators.oneOf(['foo', 'bar'])
  }
};

const state = new MyClass();

// This is OK, no error is triggered.
state.foo = 'foo';

// This triggers an error.
state.foo = 'invalid';
```

This one is simple as well, it first [guarantees](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L82)
that the argument received is an array, and if so checks if the value
[is in it](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L86).

## `validators.oneOfType`

This checks if the value passes at least one of the given validators, like in
this [fiddle](https://jsfiddle.net/metaljs/kkftpusb/).

```js
import { State, validators } from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  	validator: validators.oneOfType([validators.number, validators.string])
  }
};

const state = new MyClass();

// This is OK, no error is triggered.
state.foo = 1;

// This triggers an error.
state.foo = [];
```

Similarly to `validators.oneOf`, this first [guarantees](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L101)
that the argument received is an array. If so this will check that the value
[passes at least one](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L108)
of the validators in it.

## `validators.shapeOf`

This validator checks that the value is an object, and that its keys match
a given shape. This shape definition is an object with validators for each key,
as in this [fiddle](https://jsfiddle.net/metaljs/jg4mkqjg/).

```js
import { State, validators } from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  	validator: validators.shapeOf({
      num: validators.number()
    })
  }
};

const state = new MyClass();

// This is OK, no error is triggered.
state.foo = {
	num: 1
};

// This triggers an error.
state.foo = {
	num: 'NaN'
};
```

To make this work this validator first [checks](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L123)
if the value is an object. If so, it goes through all its keys, running their
values through the related [validator](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L136)
in the given shape definition.

Note that instead of a validator, `shapeOf` supports setting a shape's key to
an [object](https://github.com/metal/metal.js/blob/b53779c4d00538ce29126f8b77dc0748064c2e64/packages/metal-state/src/validators.js#L132)
containing both a validator and a `required` flag. That's because by default the
shape's keys are not required, so this is the way to make them so.

## Next steps

Next we'll see `Config`, the last exported value from **metal-state**.

[↪ Config](Config.md)
