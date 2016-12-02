'use strict';

import { append, delegate } from 'metal-dom';

append(
  document.body,
  `<div id="wrapper">
    <button>No Alert</button>
    <button>Alert</button>
  </div>`
);

const wrapper = document.getElementById('wrapper');

debugger;
// Will only alert when the second child of "wrapper" is clicked.
delegate(wrapper, 'click', wrapper.childNodes[1], () => alert('Clicked'));
