'use strict';

import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
	  validator: val => val > 0
  }
};

const state = new MyClass({
  foo: 1
});

debugger;
state.foo = -2;
