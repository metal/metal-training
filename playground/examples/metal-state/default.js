'use strict';

import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
	  value: 'defaultFoo'
  }
};

const state = new MyClass();

debugger;
console.log(state.foo);
