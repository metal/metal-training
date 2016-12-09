'use strict';

import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class MyRenderer extends IncrementalDomRenderer.constructor {
  update() {
    debugger;
    super.update.apply(this, arguments);
  }
}

class MyComponent extends Component {
	render() {
    IncrementalDOM.elementOpen('div');
    IncrementalDOM.text(this.foo);
    IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = new MyRenderer();
MyComponent.STATE = {
	foo: {
  	value: 'foo'
  }
};

const component = new MyComponent();
console.log(component.element);

component.foo = 'bar';
component.once('stateSynced', function() {
	console.log(component.element);
});
