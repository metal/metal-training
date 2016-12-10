'use strict';

import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

function myFn({content}) {
  IncrementalDOM.elementOpen('span');
  IncrementalDOM.text(content);
  IncrementalDOM.elementClose('span');
}

class MyComponent extends Component {
	render() {
  	IncrementalDOM.elementOpen('div');
    debugger;
	   IncrementalDOM.elementVoid(myFn, null, null, 'content', 'Function content');
		IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent();
console.log(component.element);
