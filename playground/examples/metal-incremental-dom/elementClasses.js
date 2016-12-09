'use strict';

import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class MyComponent extends Component {
	render() {
		debugger;
		IncrementalDOM.elementVoid('div');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent({elementClasses: 'myClass'});
console.log(component.element);
