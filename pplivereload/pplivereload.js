try {
    var socketio = io.connect();

    socketio.on('connect', function () {
        socketio.on('reload', function (_reload) {
            if (_reload) {
                location.reload();
            }
        });
        socketio.on('disconnect', function () {
            socketio.close();
        });
    });
} catch (_err) {
    throw new Error('Fail to load socket.io!');
}