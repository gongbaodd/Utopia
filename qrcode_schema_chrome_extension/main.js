chrome.tabs.getSelected(null,function(tab) {
    var form = document.getElementById('form');
    var image = document.getElementById('canvas');
    var tips = document.getElementById('tips');

    var QR_CODE = "http://qr.liantu.com/api.php?text=";

    form.onsubmit = function(e) {
        e.preventDefault();

        var src = QR_CODE;
        var pro = form.protocol.value;
        var url = encodeURIComponent(tab.url);
        var name = form.view.value;
        var type = form.nav.value;
        var nav = form.navigation;

        href = [pro,'://hy?','type=',type,'&url=',url];

        if (name) {
            href.push('&name=');
            href.push(name);
        }

        if (nav.checked) {
            var _nav = {};

            var title = form.title;
            var left = form.left;
            var right = form.right;

            if (title.checked) {
                var _t = {};

                var tstyle = form.tstyle.value;
                var ttext = form.ttext.value;

                _t.style = tstyle;
                _t.text = ttext;

                _nav.title = _t;
            }

            if (left.checked) {
                var _l = {};

                var lstyle = form.lstyle.value;
                var ltext = form.ltext.value;

                _l.style = lstyle;
                _l[lstyle] = ltext;

                _nav.left = _l;
            }

            if (right.checked) {
                var _r = {};

                var rstyle = form.rstyle.value;
                var rtext = form.rtext.value;

                _r.style = rstyle;
                _r[rstyle] = rtext;

                _nav.right = _r;
            }

            href.push('&navigation=');
            _nav = JSON.stringify(_nav);
            href.push(encodeURIComponent(_nav));
        }

        href = href.join('');
        src += encodeURIComponent(href);

        image.src = src;
        tips.innerHTML = href;
    };
});
