# metal-jsx

The [metal-jsx](https://github.com/metal/metal.js/tree/master/packages/metal-jsx)
package provides a renderer based on `IncrementalDomRenderer`, but that
integrates specifically with JSX.

## Usage

To use it, first install **metal-jsx** through npm, like this:
```sh
[sudo] npm install metal-jsx
```

Then you'll be able to import its contents in your ES6 modules. For example:

```js
import JSXComponent from 'metal-jsx';
```

## Exported values

These are all the values exported by **metal-jsx**:

```js
import {
  validators,
  Config,
  JSXComponent
} from 'metal-jsx';

// `State` can also be included via a default import.
import JSXComponent from 'metal-jsx';
```

The entry file is
[packages/metal-jsx/src/JSXComponent.js](https://github.com/metal/metal.js/blob/master/packages/metal-jsx/src/JSXComponent.js).

Note that `validators` and `Config` are exactly the same variables exported by
**metal-state**, so we don't need to look at the again here. They're only
exported here again to simplify the creation of JSX components without forcing
developers to import from many different modules.

### JSXComponent

If you open the entry file for **metal-jsx** you'll see that it's a very small
file. It just exports a new type of component [that uses](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-jsx/src/JSXComponent.js#L37)
a special renderer called `JSXRenderer` and a special data manager called
`JSXDataManager`.

Besides that, the only thing this file does is to define a static function
inside `JSXComponent`, called `render`, and have it just call this same function
from `IncrementalDomRenderer`. This is used to render components via functions,
instead of manually instantiating them via `new`, and again we're defining this
in `JSXComponent` to avoid forcing developers to have to directly include
another module (in this case **metal-incremental-dom**) just for a simple
function. Check out the following example of its usage:

```js
import JSXComponent from 'metal-jsx';

class HelloWorld extends JSXComponent {
  render() {
    const name = this.props.name ? this.props.name : 'World';
    return <div>Hello {name}</div>
  }
}

const component = new HelloWorld({
  name: 'Foo'
});
console.log(component.element); // <div>Hello Foo</div>
```

### JSXDataManager

Let's start with the data manager. It extends from `ComponentDataManager` and
overrides a few functions from it to change its behavior. The main function
that is overridden is [`createState_`](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-jsx/src/JSXDataManager.js#L37).
Instead of creating a single `State` instance and having it add properties
directly to the component, this method will create two separate `State`
instances: one that will add properties to a `props` object in the component,
and another that will do it for a `state` object.

Some of the functions from `ComponentDataManager` will keep working as they
were before, mostly getting data from the `State` instance that is tied to the
`state` object now. But some of them are overridden to return values from the
`State` instance for `props` instead, like `get` and `getSyncKeys`.

Another function that is also overridden is `replaceNonInternal`. Instead of
checking for properties not marked as `internal`, this method will now consider
all properties [inside `props`](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-jsx/src/JSXDataManager.js#L112) as such. It will also make sure that any
properties passed down, but that weren't previously defined via `PROPS`, will
also be set inside the `props` object. Also, whenever `replaceNonInternal` is
called, a function called `propsChanged` is called in the component, when it
exists.

### JSXRenderer

Before actually looking inside `JSXRenderer`, it's important to know that we
assume that JSX components will be using a compiler called
[**babel-plugin-incremental-dom**](https://www.npmjs.com/package/babel-plugin-incremental-dom)
to convert JSX calls into incremental dom. This
compiler needs some helper javascript functions to work, which are copy/pasted
to the file named `iDOMHelpers`.

One of these functions called `renderArbitrary`,
is the one the compiler always wraps around things that are rendered in JSX
via brackets, as in: `{name}`. If that content is a string, for example, it will
call `IncrementalDOM.text`, some special functions are called instead, and
arrays are looped. This is the only function that was changed by us to behave
a bit differently than the original version from the compiler. It can handle
rendering children elements, by automatically calling the
`IncrementalDomRenderer.renderChild` function we've seen before. Another use
case is for when the content to be rendered is `undefined` or `null`, in which
case `JSXRenderer.skipChild` is called. We'll see more about that later.

Now that we understand what `iDOMHelpers` is, we can dive into `JSXRenderer`'s
code. The only reason this renderer exists at all is to support two important
features for JSX. We'll see both of them now.

#### Returning content from "render"

Take the following use case:

```js
import JSXComponent from 'metal-jsx';

class MyComponent extends JSXComponent {
  render() {
    return this.props.children[0];
  }
}
```

In this example we have a component that expects to receive children, and just
renders the first child it receives. This doesn't really use any JSX actually,
so the compiler won't really touch this code. This means that nothing will be
rendered if we use `IncrementalDomRenderer` though.

That's why `JSXRenderer` overrides `renderIncDom` to be able to get the result
value from the component's `render` function (if there is one), and pass it
to `iDOMHelpers.renderArbitrary`. That way the appropriate incremental dom call
will be made for it when necessary, or nothing will happen otherwise.

#### Better reusage strategy for conditional components

Take the following use case:

```js
import JSXComponent from 'metal-jsx';

class MyComponent extends JSXComponent {
  render() {
    return <div>
      {this.props.remove ? null : <div><Child name="first"/></div>}
      <div><Child name="second"/></div>
    </div>
  }
}
```

In this example, when the property named `remove` is set to `true`, the first
`Child` sub component will be removed, leaving just the second one to be
rendered. If `IncrementalDomRenderer` is used as is, it will end up reusing the
instance of the first `Child` as the second `Child`, and dispose the second.
In some cases this might not cause any problems, but if `Child` holds any
internal state this can be confusing for the developer, as by looking at this
code we know that it's the first `Child` instance that should be disposed, not
the second. This happens because rendering `null` doesn't really do anything,
so incremental dom will reuse the previous first `div` as the second.

A way that helps this kind of use case to work is to automatically generate keys
for DOM elements that don't have them yet, according to their position in the
parent, and having rendering `null` and `undefined` take up a position. If this
approach was used in the previous example, during the update the second div
would still be marked as being the second one, because `null` was rendered as
the first element. We can't actually render `null`, but we can make that kind
of operation increment the position, so that the next generated key can take
that into account.

That's what the function named `generateKey` inside `JSXRenderer` does. It
overrides a similar function inside `IncrementalDomRenderer`, and only does
anything if no key has been given. In this case it will check if the element
for the component being currently patched has already been rendered. If so,
we'll generate the key according to the position we track for each element, and
return it. When we're at the patching component's element we can't know what its
position in the parent is though, since the rendering has started from it. In
this case, we check the incremental dom data to see if the element had a key
before, reusing it if it did.

Inside `iDOMHelpers`, whenever an `undefined` or `null` value is passed to
`renderArbitrary`, it will call `JSXRenderer.skipChild`, which just increments
the position via an incremental dom call. This increment operation is done via
a call to `IncrementalDOM.elementVoid` to avoid problems if a children capture
is currently happening, as in that case the function should only actually run
when (and if) the children are rendered.
