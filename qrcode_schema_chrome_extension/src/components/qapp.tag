import './header/header.tag';
import './loading/loading.tag';
import './qrcode/qrcode.tag';
import './list/list.tag';
import 'riot';
import { webvc,normal,transparent,none } from './webview.js';
import 'yo/lib/fragment/yo-list.scss';

<qapp onclick={chosen}>
    <yo-header></yo-header>
    <camel-loading if="{!qrcode}"></camel-loading>
    <qrcode if="{qrcode}" img="{qrcode}"></qrcode>
    <yo-list class="yo-list" ></yo-list>
    <script>
        var root = this.root;
        var self = this;

        this.title = opts.title;
        this.qrcode = opts.qrcode;
        this.chosen = function() {
            riot.route(this.title);
        };

        this.on('hide',()=>{
            root.style.opacity=0;

            setTimeout(function() {
                self.unmount();
            },1500);
        });
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
    <style scoped>
    :scope{
        overflow: hidden;
        position: relative;
    }
    </style>
</qapp>
