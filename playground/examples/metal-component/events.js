'use strict';

import { Component } from 'metal-component';

debugger;
const component = new Component({
	events: {
  	event1: function() {
			console.log('Event triggered');
    }
  }
});
component.emit('event1');
