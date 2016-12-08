# ComponentRegistry

`ComponentRegistry` is a place where component classes can be registered and
later accessed by their names. This is not used directly by `Component`, but
can be helpful when building `ComponentRenderer` sub classes based on templates
that reference components by their names, for example.

To register a component the developer can use the `ComponentRegistry.register`
function, as in this [fiddle](https://jsfiddle.net/metaljs/mjz89zmc/).

```js
class MyComponent extends Component {
}
ComponentRegistry.register(MyComponent);

class MyComponent2 extends Component {
}
ComponentRegistry.register(MyComponent2, 'ParamName');

class MyComponent3 extends Component {
}
MyComponent3.NAME = 'StaticName';
ComponentRegistry.register(MyComponent3);

let ctor = ComponentRegistry.getConstructor('MyComponent');
console.log(ctor === MyComponent); // true

ctor = ComponentRegistry.getConstructor('ParamName');
console.log(ctor === MyComponent2); // true

ctor = ComponentRegistry.getConstructor('StaticName');
console.log(ctor === MyComponent3); // true
```

By default the component's class name will be used when registered, but it's
also possible to pass a name to the `register` function, as well as define the
name in a static `NAME` property. The implementation is straightforward, as
can be seen [here](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-component/src/ComponentRegistry.js#L38). It'll first try to use the given name. If none is given
it'll look for the `NAME` property, and lastly call `getFunctionName` from
the **metal** package to get the class name. Once the right name is detected,
the component class is [stored](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-component/src/ComponentRegistry.js#L48).

When `getConstructor` is called it'll just retrieve the requested class,
[throwing an error](https://github.com/metal/metal.js/blob/0ed1d8adc9086870e2b1b86d79b36d77cd3c40a8/packages/metal-component/src/ComponentRegistry.js#L21)
when not found.

## Next steps

We're done with **metal-component**, so time to go to **metal-incremental-dom**.

[↪ Package: metal-incremental-dom](../metal-incremental-dom.md)
