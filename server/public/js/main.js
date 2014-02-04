var user = {};
user.name = getParam('name');

while (user.name.length === 0) {
    user.name = prompt('Please enter your name:', '');
}

var socket = io.connect('http://localhost:3000/');

socket.on('connect', function () {
    addToChatMessage('Connected!', 'glyphicon-ok', 'success');
    socket.emit('new_user', user.name);

    socket.on('event_msg', function(data) {
        console.log(data);
        data = JSON.parse(data);
        addToChatMessage(data.msg, data.icon, data.type);
    });

    socket.on('teamlead_msg', function(data) {
        console.log(data);
        data = JSON.parse(data);

        jQuery('#teamlead > .btn-group').html('');
        for (var i = 0; i < data['names'].length; i++) {
            jQuery('#teamlead > .btn-group').append('<label class="btn btn-primary"><input type="checkbox">' + data['names'][i] +'</label>');
        }

        jQuery('#teamlead').show();
        fixChatWindowHeight();
    });

    socket.on('vote_msg', function(data) {
        console.log(data);
        data = JSON.parse(data);
        jQuery('#voting > span').html(data.msg);
        jQuery('#voting').show();
        fixChatWindowHeight();
    });

    jQuery('#message').keyup(function(e) {
        var keyCode = e.which;
        if (keyCode === 13 && socket.socket.connected === true) {
            socket.emit('chat', jQuery(this).val());
            jQuery(this).val('');
        }
    });
});

socket.on('disconnect', function () {
    addToChatMessage('Disconnected.', 'glyphicon-remove', 'danger');
    socket.removeListener();
});

function msg(msg) {
    if (socket.socket.connected === true) {
        socket.emit('chat', msg);
        return user.name + ': ' + msg;
    } else {
        console.warn("You're not connected!");
        return false;
    }
}

function addToChatMessage(msg, icon, type) {
    if (typeof msg === 'undefined') {
        return false;
    }
    if (typeof icon === 'undefined') {
        icon = 'glyphicon-comment';
    }
    if (typeof type === 'undefined') {
        type = '';
    }
    jQuery('#chat-messages').append('<tr class="' + type + '"><td class="icon"><span class="glyphicon ' + icon + '"></span></td><td>' + msg + '</td></tr>');
    window.scrollTo(0,document.body.scrollHeight);
    fixChatWindowHeight();
}

function getParam(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if(results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function fixChatWindowHeight() {
    jQuery('#chat-messages').css('margin-bottom', jQuery('.navbar-fixed-bottom').height());
}