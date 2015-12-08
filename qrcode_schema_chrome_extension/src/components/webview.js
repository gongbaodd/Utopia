const PAGE_URL = window.location.href;
const QR_CODE = "http://qr.liantu.com/api.php?text=";

export function webvc(self) {
    var src = QR_CODE + encodeURIComponent(PAGE_URL);
    genrtateQR(self,src);
};

export function transparent(self) {
    var src = QR_CODE + encodeURIComponent(PAGE_URL);
    genrtateQR(self,src);
};

export function none(self) {
    var src = QR_CODE + encodeURIComponent(PAGE_URL);
    genrtateQR(self,src);
};

export function normal(self) {
    var src = QR_CODE + encodeURIComponent(PAGE_URL);
    genrtateQR(self,src);
};

function genrtateQR(self,src){
    var img = new Image();

    var src = "http://localhost:8080/api.png";
    img.src = src;
    img.onload = function() {
        self.update({qrcode:img});
    };
    img.onerror = function() {
        self.update({qrcode:src})
    };
}
