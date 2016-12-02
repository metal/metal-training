'use strict';

import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
	  writeOnce: true
  }
};

const state = new MyClass();

state.foo = 1;
debugger;
state.foo = 2;
