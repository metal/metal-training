'use strict';

import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
	  setter: val => val * 2
  }
};

const state = new MyClass();

debugger;
state.foo = 1;
