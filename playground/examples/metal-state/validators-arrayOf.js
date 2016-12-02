'use strict';

import { State, validators } from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  	validator: validators.arrayOf(validators.number)
  }
};

const state = new MyClass();

// This is OK, no error is triggered.
state.foo = [1, 2, 3];

// This triggers an error.
debugger;
state.foo = [1, '2', 3];
