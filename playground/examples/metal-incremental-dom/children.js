'use strict';

import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class ChildComponent extends Component {
	render() {
		IncrementalDOM.elementOpen('span');
    this.children.forEach(IncrementalDomRenderer.renderChild);
    IncrementalDOM.elementClose('span');
	}
}
ChildComponent.RENDERER = IncrementalDomRenderer;

class MyComponent extends Component {
	render() {
  	IncrementalDOM.elementOpen('div');
    debugger;
    IncrementalDOM.elementOpen(ChildComponent);
    IncrementalDOM.text('Text from parent');
    IncrementalDOM.elementClose(ChildComponent);
		IncrementalDOM.elementClose('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent();
console.log(component.element);
