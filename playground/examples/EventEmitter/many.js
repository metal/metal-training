'use strict';

import EventEmitter from 'metal-events';

const emitter = new EventEmitter();
debugger;
emitter.many('myEvent', 3, () => {});

emitter.emit('myEvent');
emitter.emit('myEvent');
emitter.emit('myEvent');
