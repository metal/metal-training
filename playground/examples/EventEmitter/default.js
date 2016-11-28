'use strict';

import EventEmitter from 'metal-events';

const emitter = new EventEmitter();
emitter.setShouldUseFacade(true);

debugger;
emitter.on('myEvent', () => console.log('default'), true);
emitter.on('myEvent', () => console.log('first'));
emitter.emit('myEvent');

debugger;
emitter.on('myEvent', (event) => event.preventDefault());
emitter.emit('myEvent');
