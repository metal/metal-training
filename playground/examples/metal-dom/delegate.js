'use strict';

import { append, delegate } from 'metal-dom';

append(
  document.body,
  `<div id="wrapper">
    <button>No Alert</button>
    <button class="match">Alert</button>
  </div>
  <button class="match">No Alert</button>`
);

debugger;
delegate(document, 'click', '.match', () => alert('Clicked'));
