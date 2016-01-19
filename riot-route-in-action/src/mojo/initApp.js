import $ from 'webpack-zepto';
import riot from 'riot';
import {mojo} from './index.js';
import './app.tag';

export function initApp(next) {
    var app = $('app');

    if (!app.length) {
        document.body.innerHTML += '<app>app</app>';
    }

    mojo.app = riot.mount('app');

};
