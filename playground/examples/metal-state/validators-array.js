'use strict';

import { State, validators } from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  	validator: validators.array()
  }
};

const state = new MyClass();
debugger;
state.foo = 1;
