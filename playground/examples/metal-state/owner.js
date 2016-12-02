'use strict';

import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  }
};

const obj = {};
const state = new MyClass(
	{
		foo: 1
	},
  obj
);

debugger;
console.log(state.foo, obj.foo);
