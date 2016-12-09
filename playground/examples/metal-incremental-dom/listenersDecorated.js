'use strict';

import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class MyComponent extends Component {
	handleClick() {
  	alert('Clicked Button');
  }

	render() {
    debugger;
    IncrementalDOM.elementOpen('button', null, null, 'data-onclick', 'handleClick');
    IncrementalDOM.text('Button');
    IncrementalDOM.elementClose('button');
	}
}
MyComponent.RENDERER = IncrementalDomRenderer;

const element = document.createElement('button');
element.setAttribute('data-onclick', 'handleClick');
new MyComponent({element});
