'use strict';

import { EventEmitter, EventEmitterProxy } from 'metal-events';

const origin = new EventEmitter();
const target = new EventEmitter();

debugger;
new EventEmitterProxy(origin, target);
target.on('myEvent', () => console.log('triggered'));
origin.emit('myEvent');
