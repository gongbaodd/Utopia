import './header/header.tag';
import './loading/loading.tag';
import './qrcode/qrcode.tag';
import './list/list.tag';
import 'riot';
import { webvc,normal,transparent,none } from './webview.js';
import 'yo/lib/fragment/yo-list.scss';

<qapp>
    <yo-header></yo-header>
    <camel-loading if="{!show}" onclick={chosen}></camel-loading>
    <qrcode if="{show}" img="{qrcode}"></qrcode>
    <yo-list if="{show}" class="yo-list" ></yo-list>
    <script>
        var root = this.root;
        var self = this;

        this.title = opts.title;
        this.extra = null;
        this.chosen = function() {
            riot.route(this.title);
            return true;
        };

        this.on('hide',()=>{
            root.style.opacity=0;

            setTimeout(function() {
                self.unmount();
            },1000);
        });
        this.on('show',()=>{
            root.style.cssText += 'transform: scale(1) translateY(5%);';

            this.update({show: true});

            this.webview();
        });

        this.on('toggle',(e)=>{
            this.webview();
        });

        this.webview = function() {
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
        };

    </script>
    <style scoped>
    :scope{
        overflow: hidden;
        position: relative;
    }
    </style>
</qapp>
