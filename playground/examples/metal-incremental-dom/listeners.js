'use strict';

import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

const fnListener = () => alert('Clicked Button 1');

class MyComponent extends Component {
  handleClick() {
    alert('Clicked Button 2');
  }

  render() {
    IncrementalDOM.elementOpen('div');

    // Using `on[EventName]` format, with a function reference.
    debugger;
    IncrementalDOM.elementOpen('button', null, null, 'onClick', fnListener);
    IncrementalDOM.text('Button 1');
    IncrementalDOM.elementClose('button');

    // Using `data-on[eventname]` format, with a function name.
    IncrementalDOM.elementOpen('button', null, null, 'data-onclick', 'handleClick');
    IncrementalDOM.text('Button 2');
    IncrementalDOM.elementClose('button');

    IncrementalDOM.elementClose('div');
  }
}
MyComponent.RENDERER = IncrementalDomRenderer;

new MyComponent();
