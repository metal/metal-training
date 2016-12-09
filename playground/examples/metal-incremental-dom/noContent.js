'use strict';

import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class MyComponent extends Component {
	render() {
  	// Renders nothing, so the root element should be null or undefined.
  	debugger;
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const component = new MyComponent({
	element: document.createElement('div')
});
console.log(component.element);
