'use strict';

import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo1: {
  },
  foo2: {
  }
};

const state = new MyClass({
	foo1: 1,
	foo2: 2
});
state.on('stateKeyChanged', function(data) {
  console.log('stateKeyChanged', data);
});
state.on('foo1Changed', function(data) {
	console.log('foo1Changed', data);
});
state.on('foo2Changed', function(data) {
	console.log('foo2Changed', data);
});
state.on('stateChanged', function(data) {
	console.log('stateChanged', data);
});

debugger;
state.foo1 = 10;
state.foo2 = 20;
state.foo1 = 100;
