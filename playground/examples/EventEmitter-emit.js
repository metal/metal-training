'use strict';

import EventEmitter from 'metal-events';

const emitter = new EventEmitter();
emitter.on('myEvent', (...args) => console.log(args));
debugger;
emitter.emit('myEvent', 1, 2, 3);
