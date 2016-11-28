# metal-training

Training material for developers of the
[Metal.js](https://github.com/metal/metal.js) library.

## Summary

These documents were originally created as written material closely following
the contents of a live training. They should be helpful as a source where people
can go to for information they've missed or forgotten, or even for
new developers to familiarize themselves with the codebase without watching the
training.

**Just keep in mind that this can easily become outdated**, as it references
parts of the code that may change with time.

The material presented here should help developers get more familiar with how
Metal.js works internally. It will cover the main repositories in the
[metal github org](https://github.com/metal).

The most important of all these
is [metal/metal.js](https://github.com/metal/metal.js), as it contains the
library's core modules around which all the others were built.

## How to follow this training

These are just some suggestions that can be helpful when following this
training, but they're all optional.

### Setup

Before starting, follow these instructions to setup a local playground you can
use to run and debug the code as you learn how it works:

1. Clone this repo on your machine.
2. Install npm dependencies: `npm install`.
3. Run the watch script: `npm run watch`.
4. Use the file at [playground/main.js](playground/main.js) to play with the
Metal.js modules in ES6. The watch script will automatically rebuild it for you
whenever it changes. All main modules are already included in this repo's
package.json, but feel free to install any others you also want to use.
5. Open [playground/index.html](playground/index.html) in your browser to run
your code.

### Debug examples

Every now and then you'll find some links to debug examples. These will point
you to files inside the **playground** folder with some examples you can use to
run the code we're explaining with a debugger. If you want to use them you can
either copy the code to **playground/main.js** or change
[webpack.config.js](webpack.config.js) to point to it instead, and then rebuild
with `npm run build`.

### JSFiddle

This material will constantly reference links to jsfiddle that you can open to
see some helpful examples working. You can alter these as you like on your side
to test other use cases, or even copy them to your playground if you wish to
have more control. You can see a list of all available fiddles
[here](https://jsfiddle.net/user/metaljs/fiddles/).

## Index

* [Metal.js](docs/Metal.js.md) - Covers the core modules such as metal-dom and
metal-component.
* [Build Tools](docs/build-tools.md) - Covers the build tools created to be used
in Metal.js projects, like gulp-metal.
* [Important official repos](docs/important-repos.md) - Covers other important
repos, like metal-router and metal-redux.
