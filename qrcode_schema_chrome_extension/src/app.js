import riot from 'riot';
import './app.tag';

// chrome.tabs.getSelected(null,()=>{
    document.body.innerHTML += '<app></app>';

    window.__APP__ = riot.mount('app')[0];

// });

import './router.js';
import './style/global.scss';
