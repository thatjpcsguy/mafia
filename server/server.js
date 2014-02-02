var io = require('socket.io').listen(3000);
var numPlayer = 0;
var players = {};

io.sockets.on('connection', function (socket) {
    var player = '';

    socket.on('new_player', function(p, fn) {
        player = p;

        socket.broadcast.send('--> ' + p + ' has joined');
        fn('Welcome ' + player + '! There are '+ numPlayer +' other people here.');
        numPlayer++;
    });

    socket.on('chat', function(msg, fn) {
        socket.broadcast.send(player + ': ' + msg);
    });

    socket.on('message', function (msg) {
        console.log(msg);
    });
    socket.on('disconnect', function () {
        socket.broadcast.send('<-- ' + player + ' has left');
        numPlayer--;
    });
});