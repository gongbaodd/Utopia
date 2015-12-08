const QR_CODE = "http://qr.liantu.com/api.php?text=";

import QRCode from 'qrcode';

export function webvc(self,extra) {
    var root = self.root;
    getURL(function(href) {
        var host = '://web/url?url=';
        var protocol = chooseOS(root);
        var schema = [protocol,host,encodeURIComponent(href)].join('');
        genrtateQR(self,schema);

        self.schema = schema;
    });
};

export function transparent(self,extra) {
    var root = self.root;

    getURL(function(href) {
        var host = '://hy/url?type=navibar-transparent&url=';
        var protocol = chooseOS(root);
        var schema = [protocol,host,encodeURIComponent(href)].join('');
        genrtateQR(self,schema);

        self.schema = schema;
    });
};

export function none(self,extra) {
    var root = self.root;

    getURL(function(href) {
        var host = '://hy/url?type=navibar-none&url=';
        var protocol = chooseOS(root);
        var schema = [protocol,host,encodeURIComponent(href)].join('');
        genrtateQR(self,schema);

        self.schema = schema;
    });
};

export function normal(self,extra) {
    var root = self.root;

    getURL(function(href) {
        var host = '://hy/url?url=';
        var protocol = chooseOS(root);
        var schema = [protocol,host,encodeURIComponent(href)].join('');
        genrtateQR(self,schema);

        self.schema = schema;
    });
};

function chooseOS(root) {
    var os = Array.from(root.querySelectorAll('input[name=os]'))
                  .filter((e)=>e.checked);

    return os[0].value;
};

function genrtateQR(self,schema){
    var qrcode = self.tags['qrcode'];
    var root = self.root;
    var input = root.querySelector('input[name=url]');

    input.value = schema;

    var src = QR_CODE + encodeURIComponent(schema);
    var img = new QRCode({text: schema,size: 300});

    qrcode.update({qrcode: img});
};

function getURL(callback) {
    chrome.tabs.getSelected(null,(tab)=>{
        callback(tab.url);
    });
};
