'use strict';

import { Component, ComponentRenderer } from 'metal-component';

let calledUpdate = false;
class CustomRenderer extends ComponentRenderer.constructor {
	update() {
  	calledUpdate = true;
	}
}

class MyComponent extends Component {
}
MyComponent.RENDERER = new CustomRenderer();
MyComponent.SYNC_UPDATES = true;

const component = new MyComponent();

debugger;
component.visible = false;
