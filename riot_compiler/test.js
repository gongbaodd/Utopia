var compiler = require('riot-compiler');
var file = compiler.compile(   `
    <myapp class="qapp">
        <span>{hello}</span>
        go() {
            console.log(123)
        }
        this.hello = 1
        this.on('update',function() {

        })
        <style scoped>
            :scope{
                position: relative;
            }
            :scope span{
                color: #fff;
            }
        </style>
    </myapp>
    `);
console.log(file)
