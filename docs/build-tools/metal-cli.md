# metal-cli

**metal-cli** is a command line tool that allows some helpful tasks, like
building javascript and soy, to be run via the terminal, like this.

## Usage

To use it, first install **metal-cli** through npm, like this:
```sh
[sudo] npm install -g metal-cli
```

You can easily check the list of supported commands for this cli by typing
`metal --help` in your terminal. You should then get some output like this:

```sh
Commands:
  build  Compiles ES2015 js files to the chosen ES5 format
  watch  Watches soy and js files, building them when they change
  soy    Compiles soy files to be Metal components
```

These tasks use the same modules that **gulp-metal** does, and so the logic for
them is mostly the same.

## Code

Let's start by taking a look at [`Command`](https://github.com/metal/metal-cli/blob/b4428aeaaa5ef61a8f31272a0f1e009504e1fba6/lib/Command.js#L8).
This file is pretty straightforward, it uses
[yargs](http://npmjs.com/package/yargs) to handle input from the terminal,
providing an api to quickly get the command name and its arguments. New commands
can be registered via `Command.register`.

Now we can take a look at the [entry file](https://github.com/metal/metal-cli/blob/b4428aeaaa5ef61a8f31272a0f1e009504e1fba6/index.js).
This shows that the cli simply gets the right command via `Command.get`, and
runs it, showing some logs to the user.

Let's take a look at some of these commands then. The **soy** command is very
simple. It's `run` method just calls **metal-tools-soy** directly, which we've
already seen before. The **build** command is a bit more complicated, as it has
to [run the soy command beforehand](https://github.com/metal/metal-cli/blob/b4428aeaaa5ef61a8f31272a0f1e009504e1fba6/lib/commands/build/build.js#L14),
and then run a different build for each requested format. Finally, the **watch**
command just uses **glob-watcher** to listen to changes in the requested files,
and then [calls](https://github.com/metal/metal-cli/blob/b4428aeaaa5ef61a8f31272a0f1e009504e1fba6/lib/commands/build/watch.js#L14)
the other two commands (**soy** and **build**) to rebuild them.
