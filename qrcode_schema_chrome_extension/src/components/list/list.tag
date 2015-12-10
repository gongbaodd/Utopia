import 'yo/lib/layout/yo-flex.scss';
import 'yo/lib/widget/yo-switch.scss';
import 'yo/lib/element/yo-checked.scss';
import $ from 'zepto';
<yo-list>
    <h2 class="label"></h2>
    <item class="item">
        <div class="mark">
            生成URL
        </div>
        <input name="url" type="text" class="flex" readonly style="border:0;">
    </item>
    <h2 class="label"></h2>
    <item class="item">
        <div class="mark flex">
            系统
        </div>
        <div class="cont">
            <label>
                <div class="yo-checked">
                    <input type="radio" name="os" value="qunaraphone" checked onchange="{toggle}">
                    <span class="type"></span>
                </div>
                android
            </label>
            <label>
                <div class="yo-checked">
                    <input type="radio" name="os" value="qunariphone" onchange="{toggle}">
                    <span class="type"></span>
                </div>
                iOS
            </label>
        </div>
    </item>
    <!-- <item class="item">
        <div class="mark flex">
            压缩地址
        </div>
        <div class="cont">
            <label class="yo-switch" onclick="{compress}">
                <input type="checkbox" onchange="{toggle}">
                <div class="track">
                    <span class="handle"></span>
                </div>
            </label>
        </div>
    </item> -->
    <script>
        const COM_URL = 'http://985.so/api.php?format=jsonp&callback=callback&url=';

        this.toggle = function(e) {
            this.parent.trigger('toggle',e);
        };
        this.compress = function(e) {
            var self = this;
            var root = this.root;
            var parent = this.parent.root;
            var target = e.path.filter((e)=>e.tagName === 'LABEL')[0];
            var input = target.querySelector('input');
            var schema = parent.querySelector('input[name=url]').value;
            var url = COM_URL + encodeURIComponent(schema);

            input.checked = !input.checked;

            if (input.checked) {
                $.ajaxJSONP({
                    url: url,
                    success: ajaxOk
                })
            }
            function ajaxOk(res) {
                var evt = document.createEvent('Event');
                evt.initEvent('change',true);
                input.dispatchEvent(evt);
            };
        };
    </script>
    <style scoped>
    :scope{
        display: block;
    }
    </style>
</yo-list>
