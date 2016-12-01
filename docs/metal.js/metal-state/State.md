# State

`State` is a class that can handle configuring properties and tracking changes
to their values. It can be instantiated directly, or extended to provide this
functionality to other classes.

## Configuring properties

The main feature provided by `State` is the ability to configure your object's
properties using some powerful options. We'll show these options one by one
here.

Before showing them it's important that we talk about how this configuration
can be done first. There are currently two ways of using it via `State`: either
per instance or per class type.

### Configuring per instance (`configState`)

If you have an instance of `State` you can configure it via the `configState`
function, like on this [fiddle](https://jsfiddle.net/metaljs/0echo6hq/).

```js
import State from 'metal-state';

const state = new State();
state.configState({
  foo: {
  },
  bar: {
  }
});
console.log(state.getStateKeys()); // ['foo', 'bar]
```

This example doesn't do much besides show that the keys passed to `configState`
are successfully returned by `getStateKeys`. This works because `configState`
[stores](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L255)
the config object passed to it, and `getStateKeys` simply returns [all its keys](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L361).

### Configuring per class (`STATE`)

Another option is to configure state for a class, which will cause all instances
of that class to automatically have them. Check out this
[fiddle](https://jsfiddle.net/metaljs/f62y44r2/).

```js
import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  },
  bar: {
  }
};

const state = new MyClass();
console.log(state.getStateKeys()); // ['foo', 'bar]
```

This is done in the class's [constructor](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L78)
by `configStateFromStaticHint_`. On the first time that the class is
instantiated, this function will call `configState` [passing the prototype](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L275)
as the second argument. This argument is used by `configState` as the object
where the properties should be [defined](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L250),
instead of the current `State` instance. Since they're defined in the prototype,
subsequent instances of this class won't need to define them again, as they will
be inherited automatically. In these cases `configStateFromStaticHint_` will
pass `false` to `configState` instead, so that this step can be [skipped](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L242),
helping performance.

Also note that `configStateFromStaticHint_` [calls](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L278)
`State.getStateStatic` to build the config object from the `STATE` variable.
This function just uses [getStaticProperty](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L385)
(which we've already [seen](../metal.md#getstaticproperty) before) to merge
`STATE` from super classes together.

We'll be mostly using this way of configuring state from now on, but remember
that the other way can also accomplish the same things.

### Get / set value

We know now how properties are added to `STATE`, but so far we haven't used
them for anything. Let's start by getting and setting their values. This can be
done by simply accessing them as regular variables, as in this
[fiddle](https://jsfiddle.net/metaljs/fpdtdu26/).

```js
import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  }
};

const state = new MyClass();
state.foo = 'bar';
console.log(state.foo); // 'bar'
```

Usually this wouldn't require any code to work but, due to other functionalities
that we'll explain in later sections, it's more complicated than that.
Properties configured with `State` are defined via `Object.defineProperties`,
with [a setter and a getter](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L131),
which are automatically called whenever code like the one above accesses or
sets their values.

Before we look inside these two we need to take a look at `State`'s constructor
again. You'll notice that it [defines a property](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L80)
with a fixed value set to the current instance. This is important because, as
we'll see [later](#properties-owner), `State` allows defining the configured
state in a separate object, instead of directly inside itself, and it has to be
able to access its `State` instance. Going back to the getter and setter
functions, you'll see that this property is [used](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L132) by both.

When the property is accessed, its value will be the return of
`getStateKeyValue_`, called on the appropriate `State` instance. Looking
[inside](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L371)
this function we can see that its return value comes from the `getStateInfo`
object. This object is used many times inside `State`, and it stores data about
each property, including its value.

When the property is set, `setStateKeyValue_` is called with the value it's
being set to. As can be expected, besides other things we'll explain later,
this function sets the new value in `getStateInfo`'s [object](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L593),
so that `getStateKeyValue_` can get it on the next access.

### Initial value

`State` accepts an object with initial values for its properties in the
constructor, as can be seen in this
[fiddle](https://jsfiddle.net/metaljs/09trwsro/).

```js
import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  }
};

const state = new MyClass({
  foo: 'bar'
});
console.log(state.foo); // 'bar'
```

The object with initial values is [stored](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L75)
in the constructor. One important thing to know about the initial values is that
they're not set immediately after configuring the properties. `State` only sets
them after they're accessed for the first time, in a lazy manner. In order for
this to work, `getStateKeyValue_` is [calls](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L373)
`initStateKey_` before returning the property's value. This function is the one
that [sets the initial value](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L453)
if it hasn't been initialized yet.

### Options

Now that we know how to define some properties in `State`, let's learn the
available options to configure them.

#### Default value (`value`, `valueFn`)

If no value is passed for a property via `State`'s constructor, it will be set
to the default value defined in the configuration, as in this
[fiddle](https://jsfiddle.net/metaljs/5sbjh4z3/).

```js
import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
	  value: 'defaultFoo'
  }
};

const state = new MyClass();
console.log(state.foo); // 'defaultFoo'
```

This default value is set during the property's initialization in
`initStateKey_`. Whenever a value is set for the first time, a key named
`written` is set to `true` in the property's
[info object](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L595).
`initStateKey_` calls `setDefaultValue` when this isn't set after trying to
use the initial value, as can be seen [here](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L455). This function then [uses](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L527)
the `value` configuration option.

Note that if `value` is not set it will try to use an option called `valueFn`
instead. That can be set to a function, or function name, that will called to
calculate the default value, as in this
[fiddle](https://jsfiddle.net/metaljs/po8n9pjL/).

```js
import State from 'metal-state';

class MyClass extends State {
  myFn() {
    return 'fromFnName';
	}
}
MyClass.STATE = {
  foo: {
	  valueFn: 'myFn'
  },
  bar: {
	  valueFn: () => 'fromFn'
  }
};

const state = new MyClass();
console.log(state.foo, state.bar); // 'fromFnName', 'fromFn'
```

In [this](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L529)
case `callFunction_` runs with the value of `valueFn`.

#### Validator

#### Setter

#### Required

#### Write once

## Change events

## Properties owner

## Context

## Performance optimizations
