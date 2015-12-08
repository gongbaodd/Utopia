<qrcode>

    <div>
        <canvas width=300 height=300></canvas>
    </div>
    <p>{typeof qrcode == 'string'?qrcode : qrcode.src}</p>
    
    <script>
        this.on('mount',()=>{
            var qrcode = this.qrcode;
            var root = this.root;
            if (typeof qrcode === 'string') {
                console.log(qrcode)
            } else {
                generateIMG();
            }

            function generateIMG() {
                var canvas = root.querySelector('canvas');
                var context = canvas.getContext("2d");
                context.drawImage(qrcode,0,0);
            };
        });


    </script>
    <style scoped>
        :scope > div{
            padding: .1rem;
            width: 3.2rem;
            height: 3.2rem;
            display: block;
            overflow: hidden;
            margin: .1rem auto;
            border-radius: 3px;
            border: 1px solid #aaa;
        }
        :scope > p{
            padding: .1rem .2rem;
        }
        img {
            width: 100%;
            height: 100%;
        }
    </style>
</qrcode>
