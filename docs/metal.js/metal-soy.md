# metal-soy

The [metal-soy](https://github.com/metal/metal.js/tree/master/packages/metal-soy)
package provides a renderer based on `IncrementalDomRenderer`, but that
integrates specifically with [soy templates](https://github.com/google/closure-templates).

## Usage

To use it, first install **metal-soy** through npm, like this:
```sh
[sudo] npm install metal-soy
```

Then you'll be able to import its contents in your ES6 modules. For example:

```js
import Soy from 'metal-soy';
```

## Exported values

These are all the values exported by **metal-soy**:

```js
import {
  Soy,
  SoyAop
} from 'metal-soy';

// `State` can also be included via a default import.
import Soy from 'metal-soy';
```

The entry file is
[packages/metal-soy/src/Soy.js](https://github.com/metal/metal.js/blob/master/packages/metal-soy/src/Soy.js).

### Soy

This renderer [extends `IncrementalDomRenderer`](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/Soy.js#L13),
but also adds some special handling to help developers use **soy templates**
(also called **closure templates**). We'll take a look at how these templates
are used first, and then go see how the renderer can be used with them.

### Templates

Soy templates are always defined in their own files, with the **.soy** extension.
These files can later be compiled both to Javascript and to Java, which makes
them a good choice for projects that both use these languages, as it allows the
same template to be used everywhere. Check out the following example (
unfortunately, we won't be able to use fiddles for this, since they don't
support soy files):

```
{namespace MyNamespace}

/**
 * @param? name
 */
{template .myTemplate}
  <div>
    Hello
    {call .renderName}
      {param name: $name ? $name : 'World' /}
    {/call}
  </div>
{/template}

/**
 * @param name
 */
{template .renderName}
  <span class="name">{$name}</span>
{/template}
```

As you can see, at the top of the file you need to declare a namespace. Inside
the file you can have multiple templates, each with a different name, and they
can call each other. Each template needs to declare the params they expected to
receive when called, and contain html content to be rendered. If you're curious
to learn more about all the available features, take a look at its
[site](https://developers.google.com/closure/templates/).

There are two available compilers of soy to javascript, and one of them will
convert everything to functions that do incremental dom calls. That's perfect
for our use case, as we can use all the logic that's already working in
`IncrementalDomRenderer` for components using soy as well. The `Soy` renderer
 adds a few more features that are specific to these templates.

To use `Soy` for components, the user has to use a special build tool provided
by Metal.js to compile his/her soy templates. We'll see this tool with more
details [later](../build-tools.md), when we learn about **gulp-metal**. But for
now it's important to know that this step is required, as it prepares the final
javascript template file to be used. If we'd compile the previous example with
that build tool, we'd end up with something like this:

```js
var ie_open = IncrementalDom.elementOpen;
var itext = IncrementalDom.text;

function $myTemplate(opt_data, opt_ignored, opt_ijData) {
  opt_data = opt_data || {};
  ie_open('div');
    itext('Hello');
    $renderName({name: opt_data.name ? opt_data.name : 'World'}, null, opt_ijData);
  ie_close('div');
}
exports.myTemplate = $myTemplate;

function $renderName(opt_data, opt_ignored, opt_ijData) {
  ie_open('span', null, null,
      'class', 'name');
    itext((goog.asserts.assert((opt_data.name) != null), opt_data.name));
  ie_close('span');
}
exports.renderName = $renderName;

var templates = exports;
export default templates;
```

As you see, the templates are turned into functions that receive data, and their
html contents become incremental dom calls. At the end of the file there will
be an `export default` statement exporting an object with all the template
functions.

Besides calling templates from the same file, it's also possible to call
external templates by using their full names, including their namespace. For
example:

```
{namespace MyNamespace}

/**
 * @param? name
 */
{template .myTemplate}
  <div>
    Hello
    {call MyOtherNamespace.renderName}
      {param name: $name ? $name : 'World' /}
    {/call}
  </div>
{/template}
```

### Renderer

Let's see how this integration between the templates and the Metal.js component
is done now. Since soy templates need to be defined on their own, soy components
will usually consist of two files: one for the templates, and another with the
actual component javascript code. Take a look at the following example:

**HelloWorld.soy**
```
{namespace HelloWorld}

/**
 * @param? name
 */
{template .render}
  <div>Hello {$name ? $name : 'World'}</div>
{/template}
```

**HelloWorld.js**
```js
import templates from './HelloWorld.soy.js';
import Component from 'metal-component';
import Soy from 'metal-soy';

class HelloWorld extends Component {
}
Soy.register(HelloWorld, templates);

const component = new HelloWorld({
  name: 'Foo'
});
console.log(component.element); // <div>Hello Foo</div>
```

Instead of setting a component's `RENDERER` static function directly, soy
components call `Soy.register` instead, which not only [sets up the renderer](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/Soy.js#L128)
but also [ties the component to its templates](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/Soy.js#L130)
and [calls `ComponentRegistry`](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/Soy.js#L132)
to store a map from the component's name to its class. By default, a template
called `render` will be [considered the main one](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/Soy.js#L127),
unless another name is passed to `Soy.register` as well.

#### Rendering

To actually render this `render` template, `Soy` overrides the `renderIncDom`
function from `IncrementalDomRenderer`. The behavior of calling the component's
`render` function is then replaced by automatically [calling the template](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/Soy.js#L148)
that was tied to that component via `Soy.register`. The data passed to this
templated when calling it is built by `buildTemplateData_`.

Looking inside `buildTemplateData_` you can see that gets all state properties
from the component and [copies them into a new object](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/Soy.js#L55). If any of these properties has been defined as an html
string property though, this string will first be [converted to incremental dom calls](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/Soy.js#L53)
before being added to the template's data object. This is important because
otherwise the template won't know how to render that html. The html is converted
via a function called `toIncDom`, which [delegates](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/Soy.js#L207)
the job to an external module called
[`html2incdom`](https://www.npmjs.com/package/html2incdom).

After all state properties have already been added to the data object,
`buildTemplateData_` will go through the list of params that the component's
template expects (this information is provided due to the special soy build
tool we've mentioned earlier). If any of these params don't match a state
property, but match a function in the component, that function will be added to
the object as well, and later passed down to the template call.

#### Automatic creation of state properties

To avoid boilerplate in soy components, `Soy` also automatically creates state
properties for params that are declared in a component's template, unless
these properties have already been configured via the `STATE` variable.

This is done by implementing the `getExtraDataConfig` function, which we've
seen when we looked at
[`IncrementalDomRenderer`](../metal-incremental-dom/IncrementalDomRenderer.md).
That function goes through the list of all the template's params, and
[adds them
to the return object](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/Soy.js#L32). This will later be passed down to `ComponentDataManager`,
which will create the state properties for these.

#### Nested component calls

How can a soy component create sub components? Take a look at the following
example:

**Toolbar.soy**
```
{namespace Toolbar}

/**
 * @param? name
 */
{template .render}
  <div class="toolbar">
    {call Button.render}
      {param label: 'OK' /}
    {/call}
    {call Button.render}
      {param label: 'Cancel' /}
    {/call}
  </div>
{/template}
```

With this soy file, the `Toolbar` component is able to use two `Button` sub
components, by calling the main template for `Button`. To have this work, `Soy`
uses a similar approach to `IncrementalDomRenderer`: hijacking template
functions, so that we know when a sub component's template has been called.

The first place we need to check out to understand how this works is
`Soy.register` again. If you check the [code](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/Soy.js#L131)
there again you'll notice that it makes a call to
`SoyAop.registerForInterception`, passing it the template for the component.
Entering this last function you'll see that it just [replaces](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/SoyAop.js#L52)
the original template function with `SoyAop.handleTemplateCall_`.

Back to `renderIncDom`, a function named `SoyAop.startInterception` is called
[right before](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/Soy.js#L146)
the template function. Similarly to the interception code in
**metal-incremental-dom**, this just adds this function to a stack. Later,
when one of the intercepted functions is called, `handleTemplateCall_` will run
and decide if the original function should be called, or if there's some
intercepting function that should take its place. During render this will end
up calling `handleInterceptedCall_` inside `Soy`, which just turns the template
call into [an incremental dom call](https://github.com/metal/metal.js/blob/909475385a9752748099d725cce2bea61e72396a/packages/metal-soy/src/Soy.js#L98)
that `IncrementalDomRenderer` knows how to use for handling sub components.

## Next steps

Next we'll take a look at: **metal-jsx**.

[↪ Package: metal-jsx](metal-jsx.md)
