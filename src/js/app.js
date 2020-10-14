'use strict';
import 'babel-polyfill';
import Slideshow from './modules/slideshow/slideshow';

class App {
	constructor() {
		this.routes();
	}
	routes (){
    let ss = new Slideshow();
    ss.init();
  }
}

window.App = new App();
