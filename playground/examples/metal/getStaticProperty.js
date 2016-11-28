'use strict';

import { getStaticProperty } from 'metal';

class GrandParent {}
GrandParent.STATIC_PROP = 1;

class Parent extends GrandParent {}
Parent.STATIC_PROP = 2;

class Main extends Parent {}
Main.STATIC_PROP = 3;

const add = (a, b) => a + b;

debugger;
const prop = getStaticProperty(Main, 'STATIC_PROP', add);
console.log(prop);
