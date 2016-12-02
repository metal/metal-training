'use strict';

import { State, validators } from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  	validator: validators.instanceOf(State)
  }
};

const state = new MyClass();

// This is OK, no error is triggered.
state.foo = new State();

// This triggers an error.
debugger;
state.foo = 1;
