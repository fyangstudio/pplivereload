var fs = require('fs');
var path = require('path');
var pplivereload = require('./pplivereload');

function callReload(_filePath) {

    try {
        pplivereload(_filePath);
    } catch (e) {
        console.log('pplivereload: need a index.html');
    }
}

exports.run = function (args) {

    var argN = args.length;

    switch (argN) {
        case 0:
            callReload('./index.html');
            break;
        case 1:
            var param = args[0];
            var stat = fs.lstatSync(param);

            if (stat.isDirectory()) {

                callReload(path.join(param, '/index.html'));
            } else if (stat.isFile() && path.basename(param, '.html') == 'index') {

                callReload(param);
            } else {
                console.log('pplivereload: param error!');
            }
            break;
        default :
            console.log('pplivereload: param error!');

    }

}

