var fs = require('fs');
var http = require("http");
var path = require("path");
var chokidar = require('chokidar');
var socketio = require('socket.io');

var __port;
var __target;

var __inject = '<script src="https://cdn.socket.io/socket.io-1.2.1.js"></script><script src="/pplivereload/pplivereload.js"></script>';

var __reset = function () {
    var __outHtml = fs.readFileSync(__target, 'utf-8');

    if (__outHtml.indexOf(__inject) < 0) {
        __outHtml += __inject;

        fs.writeFile(__target, __outHtml, 'utf-8', function (_err) {
            if (_err) throw _err;
            __start(__port);
        })
    } else {
        __start(__port);
    }
    console.log('pplivereload ready!');
}

var __start = function (_port) {

    var __socket;
    var __reload = false;
    var __connect = false;

    var __fileChange = function () {
        if (__connect) {
            __reload = true;
            __socket.emit('reload', __reload);
            __reload = false;

        } else {
            console.log('no browser connect!');
        }
    }


    var __getFile = function (_path, _res, _type) {

        fs.readFile(_path, function (_err, _contents) {
            if (!_err) {
                _res.setHeader("Content-Length", _contents.length);
                _res.setHeader("Content-Type", _type);
                _res.statusCode = 200;
                _res.end(_contents);
            } else {
                _res.writeHead(500);
                _res.end();
            }
        });
    }

    function server(_port, _target) {

        return http.createServer(function (_req, _res) {

            var __filename = _req.url == '/' ? "/index.html" : _req.url;

            if (__filename == '/pplivereload/pplivereload.js') {

                _res.end(fs.readFileSync(path.join(__dirname, '../pplivereload/pplivereload.js')));

            } else {

                var __extname = path.extname(__filename);
                var __localPath = path.dirname(_target);
                var __validExtensions = {
                    ".html": "text/html",
                    ".js": "application/javascript",
                    ".css": "text/css",
                    ".txt": "text/plain",
                    ".jpg": "image/jpeg",
                    ".gif": "image/gif",
                    ".png": "image/png"
                };

                var __isValidExt = __validExtensions[__extname];

                if (__isValidExt) {

                    __localPath += __filename;
                    fs.exists(__localPath, function (exists) {
                        if (exists) {

                            var __watcher = chokidar.watch(__localPath, {ignored: /[\/\\]\./, persistent: true});

                            __watcher.on('change', __fileChange);
                            __getFile(__localPath, _res, __isValidExt);
                            console.log("Serving file: " + __localPath);
                        } else {
                            console.log("File not found: " + __localPath);
                            _res.writeHead(404);
                            _res.end();
                        }
                    });
                }
            }

        }).listen(_port);

    }

    var __server = server(_port, __target);

    socketio.listen(__server).on('connection', function (_socket) {

        __connect = true;
        __socket = _socket;

        _socket.on('disconnect', function () {
            __connect = false;
        });
    });
}

module.exports = function (_target, _port) {
    __target = _target;
    __port = _port || 8080;
    __reset();
}
