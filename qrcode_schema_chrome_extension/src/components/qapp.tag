import './header/header.tag';
import './loading/loading.tag';
import 'riot';
import { webvc,normal,transparent,none } from './webview.js';

<qapp onclick={chosen}>
    <yo-header></yo-header>
    <camel-loading></camel-loading>
    <qrcode></qrcode>
    <script>
        var root = this.root;

        this.title = opts.title;
        this.chosen = function() {
            riot.route(this.title);
        };
        this.on('hide',()=>root.style.opacity=0);
        this.on('show',()=>{
            root.style.cssText += 'transform: scale(1) translateY(5%);';
            switch (this.title) {
                case 'webVC':
                    webvc(this);
                    break;
                case 'hy-normal':
                    normal(this);
                    break;
                case 'hy-transparent':
                    transparent(this);
                    break;
                case 'hy-none':
                    none(this);
                    break;
                default:
            }
        });

    </script>
    <style>
    :scope{
        overflow: hidden;
        position: relative;
    }
    </style>
</qapp>
