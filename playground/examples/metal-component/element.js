'use strict';

import { Component } from 'metal-component';

const element = document.createElement('div');
element.id = 'el';
document.body.append(element);

const component = new Component();

debugger;
component.element = '#el';
