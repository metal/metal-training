# Build Tools

Metal.js uses ES6, and encourages developers to use ES6 to import it as well.
This requires a build process for the code though, since ES6 features aren't
fully supported by browsers yet. Besides that, there are other types of
necessary build steps, like compiling templates such as soy or JSX.

Due to that, Metal.js also provides some tools to help with this build process,
as well as other tools that may be helpful when developing the library, or with
the library, such as watch, uglify, tests, lint, format, etc.

There are quite a few repos inside the [metal org](https://github.com/metal)
just for this. Some are babel plugins or presets, others are related to gulp
tasks or CLI commands. The most important of these are
[gulp-metal](https://github.com/metal/gulp-metal) and
[metal-cli](https://github.com/metal/metal-cli).

[↪ gulp-metal](build-tools/gulp-metal.md)
