'use strict';

import EventEmitter from 'metal-events';

const emitter = new EventEmitter();
const listener = () => {};
emitter.on('myEvent', listener);

debugger;
emitter.off('myEvent', listener);
emitter.emit('myEvent', 1, 2, 3);
