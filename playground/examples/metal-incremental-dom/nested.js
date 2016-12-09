'use strict';

import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class ChildComponent extends Component {
	render() {
		IncrementalDOM.elementOpen('span');
    IncrementalDOM.text('Child');
		IncrementalDOM.elementClose('span');
	}
}
ChildComponent.RENDERER = IncrementalDomRenderer;

class MyComponent extends Component {
	render() {
    IncrementalDOM.elementOpen('div');
    debugger;
    IncrementalDOM.elementVoid(ChildComponent);
    IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent();
console.log(component.element);
