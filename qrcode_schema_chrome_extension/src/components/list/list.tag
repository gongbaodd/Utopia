import 'yo/lib/layout/yo-flex.scss';
import 'yo/lib/widget/yo-switch.scss';
<yo-list>
    <h2 class="label"></h2>
    <item class="item">
        <div class="mark flex">
            压缩地址
        </div>
        <div class="cont">
            <label for="" class="yo-switch">
                <input type="checkbox" checked>
                <div class="track">
                    <span class="handle"></span>
                </div>
            </label>
        </div>
    </item>
    <style scoped>
    :scope{
        display: block;
        position: absolute;
        width: 100%;
        height: 3rem;
        bottom: 0;
    }
    </style>
</yo-list>
