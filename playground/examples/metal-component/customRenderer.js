'use strict';

import { Component, ComponentRenderer } from 'metal-component';

class CustomRenderer extends ComponentRenderer.constructor {
	render(component) {
		component.element = document.createElement('span');
    component.element.textContent = 'Custom content';
    component.informRendered();
  }
}

class MyComponent extends Component {
}
MyComponent.RENDERER = new CustomRenderer();

debugger;
new MyComponent();
