var ndir = require('ndir');
var assert = require('assert');
var fs = require('fs');

var lineNumber = 0;
var mojoCount  = 0;
var codes = [];
var total = {};
var ID_REG = /^\s*id\s:\s"(.*)"\s,$/;
var FILE_REG = /^\s*filename\s:\s"(.*)"\s,$/;
var END_REG = /^\s*__context\.____MODULES\[.*\].*module\.exports;$/;

ndir.createLineReader('./bindcard@dev.js').on('line', function(line) {
  assert.ok(Buffer.isBuffer(line));
  ++lineNumber;
  var str = line.toString();
  if (str == ";(function(__context){") {
      mojoCount++;
      var code = {
          start: lineNumber
      };
      codes.push(code);
  };
  if (ID_REG.test(str)) {
      codes[codes.length-1].id = str.replace(ID_REG,'$1');
  };
  if (FILE_REG.test(str)) {
      codes[codes.length-1].name = str.replace(FILE_REG,'$1');
      console.log(str.replace(FILE_REG,'$1'))
  };
  if (END_REG.test(str)) {
      var code = codes[codes.length-1];

      code.end = lineNumber;
      code.length = code.end - code.start;
  };
  // console.log('%d: %s', ++lineNumber, line.toString());
}).on('end', function() {
  total.length = lineNumber;
  total.codes  = codes;
  total.files  = mojoCount;
  fs.appendFileSync('log.txt','[TOTAL LENGTH]'+lineNumber+'\n');
  fs.appendFileSync('log.txt','[TOTAL FILES]'+mojoCount+'\n');
  var max = "";
  var longest = 0;
  for (var i = 0; i < codes.length; i++) {
      for (var j = i+1; j < codes.length; j++) {
          if (codes[i].length < codes[j].length) {
              codes[i] = [codes[j],codes[j]=codes[i]][0];
          }
      }
  }
  for (var i = 0; i < codes.length; i++) {
      var code = codes[i];
      fs.appendFileSync('log.txt','['+code.name+']['+code.id+']'+code.length/lineNumber*100+'%,'+code.length+'行\n');
      if (longest<code.length) {
          max = code.id
          longest = code.length
      }
  }
  console.log('read a file done.')
  console.log(total)
}).on('error', function(err) {
  console.log('error: ', err.message)
});
