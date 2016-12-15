# gulp-metal

**gulp-metal** provides a collection of gulp tasks, all ready to be used on
Metal.js projects.

To understand how they work it's important to first have a
good understanding of [gulp](https://github.com/gulpjs/gulp) itself, so let's
start by taking a look at it. Note that this won't be a full gulp tutorial, so
if you're not very familiar with it, it'd be best to stop for a while to go
deeper into **gulp** first.

## gulp

Gulp is a build system that makes use of file streaming and piping to perform
tasks. It can be really helpful when you need to automate something related to
file handling, as everything is done with pure javascript, and there are a lot
of npm modules out there with gulp plugins you can use to build your tasks.

To use it in a project all you need is to:

1. Install gulp globally, with `npm install --global gulp-cli`.
2. Install gulp locally (yes, they require both), with
`npm install gulp --save-dev`.
3. Create a file named **gulpfile.js**. It will define the tasks you want to
use.

Check out the following example of a **gulpfile.js**:

```js
var concat = require('gulp-concat');
var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('build', function() {
  return gulp.src('src/**/*.js')
    .pipe(concat('bundle.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});
```

Even without knowing much about gulp, it's possible to read this file and have
an idea of what it's doing. It's basically defining a task named **build**,
which will get all javascript files inside the **src** folder, concatenate them
to a file named **bundle.js**, uglify it, and then put it inside the **build**
folder. To run this task you'd just need to type `gulp build` in your terminal.

So, as you can see, tasks are created by calling this `gulp.task` function. It
can receive its name and a handler function. Inside the handler, `gulp.src` is
used to determine the files that the task will use to start the stream. The
value returned by that will allow chaining `pipe` calls to other functions,
meant to handle these files.

Files will go down the stream, and go through these functions in the order
defined by these `pipe` calls. Each of these functions will receive the stream
files and decide what to output back to the stream. `concat`, for example, will
bundle all the stream files into a single one, and output just that bundle to
the stream again. `uglify` will never access the original files, just the one
that `concat` created, and it will be `uglify`'s turn to decide what to do with
it, and what to output next.

One thing that's important to know is that the files going through the stream
are by default handled independently, even in parallel. For example, it's
possible for a file to be in a task's third pipe while another is still being
transformed at the first. Pipelines such as `concat` can decide to buffer the
stream files until all of them are received before doing something though, such
as concatenating them together. For transformations that can be independently,
this approach from gulp can speed things up though, as while a file is still
being read, another may start being processing, instead of having to wait, for
example.

The final pipe used in the example code calls `gulp.dest`. This function is
usually at the end of a task, as it writes the files in the stream to the
specified folder, in this case **build**.

Finally, the task handler function returns the return value from all these
calls. This is important, since the operations done by the task are asynchronous,
so this return value helps gulp determine when the stream is done, so that it
can inform the user that the task has finished in the terminal. If nothing is
returned, **gulp** will assume that the task is synchronous, and will end it
immediately after the handler function finishes running. Another option is to
have the handler use the `done` callback passed to it, as in the following
example:

```js
var concat = require('gulp-concat');

gulp.task('build', function(done) {
  someAsyncFunction(done);
});
```

In this case the task will end once `done` is called, so you can use the task
to run any asynchronous function and pass `done` as its callback.

### Task dependencies

It's possible to define a gulp task, specifying other tasks that should run
before it, like this:

```js
gulp.task('build', ['clean'], function(done) {
  // My task code
});
```

In this case, whenever `gulp build` is called, the **clean** task will run
first, and **build** will only start after that finishes. This second argument
can specify any number of tasks as dependencies.

### Watch

Gulp also makes it easy to write tasks that will automatically watch for changes
in some specified files, and trigger tasks to handle them when that happens.
For example:

```js
gulp.task('watch', function(done) {
  gulp.watch('src/**/*.js', ['buildJs']);
  gulp.watch('src/**/*.css', ['buildCss']);
});
```

After running this task, every time that a javascript file in **src** is
changed, the gulp task named **buildJs** will be called. In this case we want
this task to keep running forever, so we can just receive the `done` function,
but never use it.

## gulp-metal

Now that we're more familiar with **gulp**, we can start looking at
**gulp-metal**. Instead of being one more gulp plugin, gulp-metal is actually
a collection of tasks, already created for you. To use it, you need something
like this in your **gulpfile.js**:

```js
var metal = require('gulp-metal');
metal.registerTasks(options);
```

Calling `registerTasks` will add enable the tasks provided by **gulp-metal** to
be used in your project. This function receives an optional object with options
for configuring those tasks. We'll see these options as we start looking at the
tasks themselves.

If you look at the [entry file](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/index.js)
for **gulp-metal**, you'll see that it exports `registerTasks`, but gets it from
another file, so let's go to it.

As you can see, the function returned by that file [creates many gulp tasks](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/lib/tasks/index.js).
The ones that are defined directly inside this function are the most simple ones,
such as `clean`, `lint`, `uglify` and `watch`. Those can be understood just by
looking at their code, but it's important for us to take a special look at the
ones with the **build** prefix.

### Build tasks

Let's start with the **build** task. It [uses](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/lib/tasks/index.js#L55)
a function named `runSequence` to run several other tasks in order. I've
mentioned that you can define task dependencies via the second argument to the
`gulp.task` call, but the tasks defined there will always run in parallel,
unless they've also specified that they depend on one another. `runSequence` is
very useful when you need some tasks to run in order, only starting after the
previous one has finished. So, in this case, the **build** task will first run
**clean**, then after that finishes it will run both **css** and **build:js**
(these will run in parallel, since they were given in an array). Once these two
are done, it will be **uglify**'s turn, and then **build** will end.

Looking at **build:js** next you'll see that it just runs the tasks specified
by the [`mainBuildJsTasks` option](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/lib/tasks/index.js#L59).
This is time to start looking at the supported options then. At the beginning of
the `registerTasks` function, you'll see a [call](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/lib/tasks/index.js#L59)
to `normalizeOptions`. This function will grab the given options object and
[set the default values](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/lib/options.js#L7)
for any config that wasn't given. If we go down the file we'll [find](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/lib/options.js#L39)
that the default value for `mainBuildJsTasks` is **build:globals:js**. That task
is not defined directly inside `registerTasks`, but by its [call](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/lib/tasks/index.js#L22)
to a function named `globalTasks.`

#### Globals

In that function you'll find the [**build:globals:js** task](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/lib/tasks/globals.js#L22).
You can see that it calls a function from a module named
**metal-tools-build-globals**. This module is also part of the **metal** org in
github, you can check it out [here](https://github.com/metal/metal-tools-build-globals).

We won't go inside it though, because it's about to be deprecated. It was built
for us to have a way of bundling our ES6 library into a single file that
replaced ES6 modules with global variables. At the time this was built, ES6 was
still beginning to be used, and there weren't so many tools as there are today
for this kind of thing. We'll soon be moving from using
**metal-tools-build-globals** to using **metal-tools-build-rollup** by default,
as it can provide us with what we want without us having to maintain our own
code for this, besides being good for removing dead code. If you open this
rollup repo, you'll see that it just [calls rollup](https://github.com/metal/metal-tools-build-rollup/blob/master/index.js)
to handle the build, passing it any options that the developer may have chosen.

#### jQuery

There are other tasks inside the `globalTasks` function though. Another
important one is **build:globals:jquery:js**. This task will also build all
the source files to a bundle, but it will also make components exported there
support being called via jQuery. This last part is done by another module
called [**metal-tools-build-jquery**](https://github.com/metal/metal-tools-build-jquery).

Going inside this module you can see that it just [adds a footer](https://github.com/metal/metal-tools-build-jquery/blob/master/lib/pipelines/addJQueryAdapterRegistration.js#L8)
to each file it receives. This footer adds a call to `JQueryAdapter.register`,
using the file's name to create a name for the jQuery function that will be
created for that component. `JQueryAdapter` comes from another module in the
**metal** org, called [**metal-jquery-adapter](https://github.com/metal/metal-jquery-adapter).

Note that there is another task inside **gulp-metal** that also convert
components to be used via  jQuery, and uses the same
**metal-tools-build-jquery** module for this, called **build:amd:jquery:js**.
The idea here is the same, the only difference is that this is done for AMD
files instead of for a global bundle.

#### AMD

Besides a globals build, **gulp-metal** also provides a task for building files
to AMD. Take a look at the following example, showing the output of the `State`
file in **metal-state** after being built to AMD:

```js
define(
  ['exports', 'metal/src/metal', 'metal-events/src/events'],
  function (exports, _metal, _events) {
    // State code here

    exports.default = State;
  }
);
```

`State` has [two import statements](https://github.com/metal/metal.js/blob/60efbe1a22f180e0a92dc088ca5ad0f14807d012/packages/metal-state/src/State.js#L3),
one for `metal` and another for `metal-events`. As you can see, the resulting
AMD file also lists these dependencies, but it lists them in a more specific
way, already pointing to the entry file. Note that it doesn't use the full path
to the entry files though, but rather the module's name concatenated with the
path starting from **src**. Building files to AMD format can be easily done by
just using [babel](https://babeljs.io/) and its plugins, but this automatic
resolution of names to entry files is done by our own code.

The AMD gulp task is defined by [callling](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/lib/tasks/index.js#L20)
the `amdTasks` function. There you can see that, again, we're using a separate
module for the main logic, this time called [**metal-tools-build-amd**](https://github.com/metal/metal-tools-build-amd/blob/master/lib/pipelines/buildAmd.js).

The main thing we need to understand in this module is how it does this
conversion from the imported module's name to its entry file's path. This is
done inside an option called `resolveModuleSource` [passed to babel](https://github.com/metal/metal-tools-build-amd/blob/master/lib/pipelines/buildAmd.js#L28).
There we'll just return the original source if it's a relative path, but
otherwise we'll call `getAmdModuleId`, and pass the result of
`renameWithoutJsExt` to it.

So let's see `renameWithoutJsExt` first. This is the function that will find the
entry file of the given module, and will return its full path, but without the
**.js** extension. To do that, it calls a function from another module, called
`babel-preset-metal-resolve-source`. This is a babel preset we use when we want
this entry path resolution logic to run in babel. In this particular case, we
can't just use it directly inside babel's configuration because we need this
logic to run outside it as well.

Inside `babel-preset-metal-resolve-source`, we first check the **package.json**
file to see if it has a **jsnext:main** entry. If so, we'll [use that](https://github.com/metal/babel-preset-metal-resolve-source/blob/master/index.js#L22),
otherwise we'll let node's [resolve](https://github.com/metal/babel-preset-metal-resolve-source/blob/master/lib/resolve.js#L7)
function run its default behavior, of looking up **main** instead.

The result from `renameWithoutJsExt` is wrapped around `getAmdModuleId`, which
will transform the full path it receives into a path relative to `node_modules`.
This is the path babel will use when building the AMD file.

### Soy task

**gulp-metal** also provides a **soy** task, which is already setup to always
run before the **build** task, [being listed as its dependency](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/lib/tasks/index.js#L66).
This task is created by the [call](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/lib/tasks/index.js#L24)
to the `soyTasks` function. Going [there](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/lib/tasks/soy.js)
you'll see that it [calls](https://github.com/metal/gulp-metal/blob/3b67010e4632dd00ea04d01343619fb6cb4c4bee/lib/tasks/soy.js#L14)
another module for most of the work, called **metal-tools-soy**, which is also
inside the **metal** organization. The logic provided by this module is required
by all soy components in Metal.js, so it's important to understand what it does.

Let's go straight to the [exported function](https://github.com/metal/metal-tools-soy/blob/44dba5d7137f2fd4ef4d0ba1ac8cf9f2a06df876/lib/pipelines/compileSoy.js#L29)
of the file that is used by the **soy** task. You can see that it's using a
function called `combiner`, and passing it several different functions. This
`combiner` function is used when you need to combine different stream handlers,
so that one will be run after the other. It's the same idea as gulp's pipe,
but in this case we're not directly inside a gulp task, we're actually building
a plugin to be used inside a gulp pipe. In this case, `combiner` can be very
helpful.

#### Phase 1: params extraction

The first stream handler that gets passed to `combiner` is using `gulp-if` to
decide if `extractParams` should be called. `gulp-if` is another stream handler
that will call what you pass to it according to a given flag. In this case,
we're checking the `skipMetalGeneration` option. This option can be used in
case the user wants to run the soy compiler, but skip all the extra handling
done for Metal.js components. It's `false` by default.

Let's assume that this option is `false`. In this case we'll run `extractParams`,
which is where we go through the given soy files and get some information about
the template's params that will be later used when adding more data to the final
compiled soy file. To do this, it makes use of
[soyparser](https://www.npmjs.com/package/soyparser),
which will find all the templates and their params for us, so we just need to
[store them](https://github.com/metal/metal-tools-soy/blob/44dba5d7137f2fd4ef4d0ba1ac8cf9f2a06df876/lib/pipelines/compileSoy.js#L118)
for later use.

#### Phase 2: soy compilation

After all the information we need has already been extracted from the original
soy files, we can actually compile them to javascript. This is done by a [call](https://github.com/metal/metal-tools-soy/blob/44dba5d7137f2fd4ef4d0ba1ac8cf9f2a06df876/lib/pipelines/compileSoy.js#L31)
to `compileToIncDom`. This is another stream handler that will wait for all the
soy files to arrive so that they can all be compiled with a single call to the
official compiler from google, which will turn the templates into incremental
dom calls. This compiler is a **jar** file though, so we run it as a [child process](https://github.com/metal/metal-tools-soy/blob/44dba5d7137f2fd4ef4d0ba1ac8cf9f2a06df876/lib/pipelines/compileSoy.js#L205). After everything is done, we [emit](https://github.com/metal/metal-tools-soy/blob/44dba5d7137f2fd4ef4d0ba1ac8cf9f2a06df876/lib/pipelines/compileSoy.js#L213)
the compiled files to the stream.

#### Phase 3: enhancement of compiled code for Metal.js

After the files have been compiled, we enhance the results with a few more
things that are important for the template's integration with Metal.js
components. Some of these include:

* [Adding params info](https://github.com/metal/metal-tools-soy/blob/44dba5d7137f2fd4ef4d0ba1ac8cf9f2a06df876/lib/pipelines/compileSoy.js#L139)
for each template
* [Creating a simple component](https://github.com/metal/metal-tools-soy/blob/44dba5d7137f2fd4ef4d0ba1ac8cf9f2a06df876/lib/pipelines/compileSoy.js#L150)
and exporting it, to reduce boilerplates for components that don't need js code.
* [Exporting](https://github.com/metal/metal-tools-soy/blob/44dba5d7137f2fd4ef4d0ba1ac8cf9f2a06df876/lib/pipelines/compileSoy.js#L156)
the object with all templates in the file.
* [Replacing calls](https://github.com/metal/metal-tools-soy/blob/44dba5d7137f2fd4ef4d0ba1ac8cf9f2a06df876/lib/pipelines/compileSoy.js#L192)
to `goog.require` for external templates with a calls to `Soy.getTemplate`, to
avoid problems with the order in which templates are imported via ES6.

### Test tasks
