'use strict';

import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
	  required: true
  }
};

const state = new MyClass({
  foo: 1
});

debugger;
state.foo = null;
