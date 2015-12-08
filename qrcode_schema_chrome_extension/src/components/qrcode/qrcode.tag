<qrcode>

    <div class="canvas">
    </div>

    <script>
        this.on('mount update',()=>{
            var qrcode = this.qrcode;
            var root = this.root;

            qrcode && generateIMG();

            function generateIMG() {
                var canvas = root.querySelector('.canvas');
                canvas.innerHTML = '';
                canvas.appendChild(qrcode);
            };
        });


    </script>
    <style scoped>
        :scope > div{
            width: 3.2rem;
            height: 3.2rem;
            padding: .1rem;
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
