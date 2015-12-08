const PAGE_URL = window.location.href;
const QR_CODE = "http://qr.liantu.com/api.php?text=";

export function webvc(self) {
    var img = new Image();
    // var src = QR_CODE + encodeURIComponent(PAGE_URL);
    var src = "http://localhost:8080/api.png";
    img.src = src;
    img.onload = function() {
        self.update({qrcode:img});
    };
    img.onerror = function() {
        self.update({qrcode:src})
    };
};

export function transparent(self) {

};

export function none(self) {

};

export function normal(self) {

};
