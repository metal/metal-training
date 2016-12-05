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

*[Debug example](../../../playground/examples/metal-state/configState.js)*

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

*[Debug example](../../../playground/examples/metal-state/STATE.js)*

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
sets their values. Check out the function's [documentation](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties)
if you're curious.

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

*[Debug example](../../../playground/examples/metal-state/initialValue.js)*

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

*[Debug example](../../../playground/examples/metal-state/default.js)*

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

You can also pass a validator function in the configuration. It will be called
automatically whenever the property's value is set, and should return a
boolean indicating if the change should actually be made or not. Check it out
in this [fiddle](https://jsfiddle.net/metaljs/drug23dd/).

```js
import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
	  validator: val => val > 0
  }
};

const state = new MyClass();

state.foo = 1;
console.log(state.foo); // 1

state.foo = -2;
console.log(state.foo); // 1

state.foo = 3;
console.log(state.foo); // 3
```

*[Debug example](../../../playground/examples/metal-state/validator.js)*

This works because inside `setStateKeyValue_` we first [validate](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L587)
the new value with `validateKeyValue_` before actually setting it, skipping
everything when it returns `false`. It's important to now that default values
are not validated, they're already considered valid as they're part of the
configuration as well, which is why `validateKeyValue_` skips the check if
the property is still [being initialized](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L638).`callValidator_` is the one that actually runs the configured
function via `callFunction_`.

As you can see from the [code](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L189), validators can also return errors instead of a boolean, in which case
the new value will trigger the error instead of being ignored.

Remember how we said that initial values are set lazily, only after the
property is accessed for the first time? If they went through this normal flow
we've just explained, sometimes they'd only get validated a while after being
passed via the constructor and maybe never at all, so the errors wouldn't be
triggered at the expected time. To go around this we [manually validate](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L260)
them inside `configState`.

#### Setter

It's also possible to define a custom setter that can change the received
value into another before passing it to the property. Check out this
[fiddle](https://jsfiddle.net/metaljs/tf8z34h1/) example.

```js
import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
	  setter: val => val * 2
  }
};

const state = new MyClass();

state.foo = 1;
console.log(state.foo); // 2

state.foo = 2;
console.log(state.foo); // 4
```

*[Debug example](../../../playground/examples/metal-state/setter.js)*

After a new value is validated, it goes through the [setter](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L593). As expected, `callFunction_` is also [called](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L168)
for this.

#### Required

A property can be defined as required, meaning that it will trigger an error
if set to `null` or `undefined`, like on this
[fiddle](https://jsfiddle.net/metaljs/hthe6qt6/).

```js
import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
	  required: true
  }
};

const state = new MyClass();
// Error: The property called "foo" is required but didn't receive a value.
```

*[Debug example](../../../playground/examples/metal-state/required.js)*

After a value is set, the [code](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L594)
asserts that it's not `null` or `undefined`, logging an [error](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L100)
when it is.

Again, as initial values are set lazily, this check is done [manually](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L259)
inside `configState` too.

#### Write once

It's also possible to define that a property can only receive a value once,
and later behave as read-only, like on this
[fiddle](https://jsfiddle.net/metaljs/k3yfuv3d/).

```js
import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
	  writeOnce: true
  }
};

const state = new MyClass();

state.foo = 1;
state.foo = 2;
state.foo = 3;
console.log(state.foo); // 1
```

*[Debug example](../../../playground/examples/metal-state/writeOnce.js)*

This is done via another check inside `setStateKeyValue_`, done by the function
named `canSetState`, as you can see [here](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L586).
It [uses](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L204)
the `written` property we've mentioned before to skip new values after the
first.

### Blacklist (`setKeysBlacklist`)

It's possible to indicate to `State` that some property names shouldn't be
allowed. This is done via the `setKeysBlacklist` function, as in the following
[fiddle](https://jsfiddle.net/metaljs/tz76ge3u/).

```js
import State from 'metal-state';

const state = new State();
state.setKeysBlacklist({
	bar: true
});

try {
  state.configState({
    foo: {
    },
    bar: {
    }
  });
} catch (error) {
	// Error: It's not allowed to create a state key with the name "bar".
}
```

`setKeysBlacklist` expects an object mapping property names to booleans, where
`true` indicates that the name should not be allowed. Looking at its [code](https://github.com/metal/metal.js/blob/2ad01ab8b6f08fd112fc0dec01374200f82e25aa/packages/metal-state/src/State.js#L559)
you can see that it just stores this map for later use. It's then used inside
`configState`, when it [calls](https://github.com/metal/metal.js/blob/2ad01ab8b6f08fd112fc0dec01374200f82e25aa/packages/metal-state/src/State.js#L246)
`assertValidStateKeyName_` to validate names.

## Change events

Besides configuring properties, `State` also tracks changes to their values,
and emits events to notify of them (it extends
[EventEmitter](../metal-events/EventEmitter.md)). This is done with two types of
events, which will both be explained now.

### Per property change

`State` emits two events immediately after each property's value changes. The
name of the first is based on the property's name, as in:
`<propertyName>Changed`. The second has a generic name: `stateKeyChanged`. Both
provide the exact same payload, containing the key name, its previous value and
its new one. Check it out in this
[fiddle](https://jsfiddle.net/metaljs/a3jae2o7/).

```js
import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  }
};

const state = new MyClass({
	foo: 'foo'
});
state.on('stateKeyChanged', function(data) {
  console.log(data); // {key: 'foo', newVal: 'bar', prevVal: 'foo'}
});
state.on('fooChanged', function(data) {
	console.log(data); // {key: 'foo', newVal: 'bar', prevVal: 'foo'}
});
state.foo = 'bar';
```

*[Debug example](../../../playground/examples/metal-state/events.js)*

Every time a new value is set, `setStateKeyValue_` will [call](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L596)
a function named `informChange_` to trigger change events. `informChange_` will
then [check](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L613)
if the value has actually changed (it may have been set to same thing as before
or have just been set for the first time). If so, it will [trigger both events](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L435).

### Batched

Besides these two immediate events, `State` also triggers another asynchronously
after changes are made, which batches multiple changes together to be informed
a single time. Check out this [fiddle](https://jsfiddle.net/metaljs/7qwmxcv4/).

```js
import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo1: {
  },
  foo2: {
  }
};

const state = new MyClass({
	foo1: 1,
	foo2: 2
});
state.on('stateChanged', function(data) {
  console.log(data);
	// {
	//   changes: {
	//     foo1: {key: 'foo1', newVal: 100, prevVal: 1}
	//     foo2: {key: 'foo1', newVal: 20, prevVal: 2}
	//   }
	// }
});

state.foo1 = 10;
state.foo2 = 20;
state.foo1 = 100;
```

*[Debug example](../../../playground/examples/metal-state/events.js)*

This batch event is prepared inside `informChange_` as well, with a [call](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L437)
to `scheduleBatchEvent_`. If no batched event is pending yet, one will be
[scheduled](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L488)
for the next tick. Otherwise the data for this new change will be [merged](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L496)
with the current batch data, so that it will be in the next event as well. When
the time comes, the event is [emitted](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L301)
and the batched data is reset so that a new event can be scheduled on the next
change.

## Properties owner

So far we've always used `State` instances that add properties to themselves.
It's possible to indicate to `State` that the properties should be added on
another object though, by passing it as the constructor's second argument,
as can be seen in this [fiddle](https://jsfiddle.net/metaljs/f6n2u1os/).

```js
import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  }
};

const obj = {};
const state = new MyClass(
	{
		foo: 1
	},
  obj
);
console.log(state.foo, obj.foo); // undefined, 1
```

*[Debug example](../../../playground/examples/metal-state/owner.js)*

When this second argument is passed in the constructor, it's [stored](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L54)
by `State` in a variable named `this.obj_`, which defaults to `this`. If you
look through the code you'll notice that all properties are
[defined in this variable](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L250),
including the [reference to the state instance](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L80).

## Context

It's also possible to pass `State` a different object called `context` as the
third argument to the constructor. When given, this context is the one that will
be used to [emit change events](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L435),
as well as to [call functions](https://github.com/metal/metal.js/blob/602956442da6887dcfe7e635b98e948a9c6dd058/packages/metal-state/src/State.js#L151)
passed in the configuration object.

## Next steps

Now that we've covered `State`, let's check out `validators`.

[↪ validators](validators.md)
