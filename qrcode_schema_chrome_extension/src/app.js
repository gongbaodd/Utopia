import riot from 'riot';
import './app.tag';

// chrome.tabs.getSelected(null,()=>{
    document.body.innerHTML += '<app></app>';

    riot.mount('app');
// });

import './router.js';
import './style/global.scss';
