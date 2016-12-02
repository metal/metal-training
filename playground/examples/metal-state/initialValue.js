'use strict';

import State from 'metal-state';

class MyClass extends State {
}
MyClass.STATE = {
  foo: {
  }
};

const state = new MyClass({
  foo: 'bar'
});

debugger;
console.log(state.foo);
