var io = require('socket.io').listen(3000);
var users = {};

var characters = {
    1: {
        name: 'Loyal Servant of Arthur',
        desc: 'You\'ve got no special abilities',
        evil: false,
        pregame: function() {
            return '';
        }
    },
    2: {
        name: 'Minion of Mordred',
        desc: 'You only know who the other spies are.',
        evil: true,
        pregame: function() {
            var spies = getSpies();
            return 'The spies are ' + spies.join(', ');
        }
    },
    3: {
        name: 'Merlin',
        desc: 'You can see who the spies are. Do not make it obvious because if the resistence win, the spies can assasinate you leading to a spy victory.',
        evil: false,
        pregame: function() {
            var spies = getSpies();
            return 'The spies are ' + spies.join(', ');
        }
    },
    4: {
        name: 'Assassin',
        desc: 'If the Resistance win, you have the final say on assassinating who you think is Merlin',
        evil: true,
        pregame: function() {
            var spies = getSpies();
            return 'The spies are ' + spies.join(', ');
        }
    },
    5: {
        name: 'Percival',
        desc: 'Percival knows who Merlin is.',
        evil: false,
        pregame: function() {
            //determine who merlin and morgana are
            var spies = [];
            for (var name in users) {
                if ([3].indexOf(users[name].characterId) !== -1) {
                    spies.push(name);
                }
            }
            spies = shuffle(spies);
            return spies.join(' or ') + ' is Merlin ';
        }
    }
};

var charactersInGame = {
    5: [1, 2, 3, 4, 5]
};

var charactersInRound = {
    5: [2, 3, 2, 3, 3]
}

var game = {
    leader: 0,
    leadershipOrder: null,
    round: 0,
    inProgress: false
}

var startGameInterval = setInterval(checkGameStart, 10000);


io.sockets.on('connection', function (socket) {
    var name = '';

    socket.on('new_user', function(n, fn) {
        var u = new User(socket);
        name = n;
        if (typeof users[name] !== 'undefined' && users[name].online === true) {
            return;
        }

        users[name] = u;

        socket.broadcast.emit('event_msg', JSON.stringify({
            type: 'info',
            icon: 'glyphicon-info-sign',
            msg: name + ' has joined'
        }));

        if (game.inProgress === false) {
            clearInterval(startGameInterval);
            checkGameStart();
            startGameInterval = setInterval(checkGameStart, 10000);
        }
    });

    socket.on('chat', function(msg, fn) {
        socket.broadcast.emit('chat', JSON.stringify({
            name: name,
            msg: msg
        }));
    });

    socket.on('team_select', function(data, fn) {
        if (game.leadershipOrder[game.leader] === name) {
            data = JSON.parse(data);
            if (data.length === charactersInRound[Object.keys(users).length][game.round - 1]) {
                sendMessageToAllUsers(
                    'info',
                    'glyphicon-info-sign',
                    name + ' has chosen who will go on the mission.'
                );
                sendVoteToAllUsers(
                    name + ' has selected the following players to go on this mission: ' + data.join(', ')
                );
            } else {
                sendMessageToSpecificUser(
                    name,
                    'danger',
                    'glyphicon-remove',
                    'You must select ' + charactersInRound[Object.keys(users).length][game.round - 1] + ' players to go on the mission.'
                );
            }
        }
    });



    socket.on('disconnect', function () {
        socket.broadcast.emit('event_msg', JSON.stringify({
            type: 'info',
            icon: 'glyphicon-info-sign',
            msg: name + ' has left'
        }));

        //users[name].online = false;

        //if (getOnlineUserCount() < 3) {
       //     for (var name in users) {
        //        if (users[name].online === false) {
                    delete users[name];
        //        }
        //    }

            cleanUpGame();
            sendMessageToAllUsers(
                'danger',
                'glyphicon-remove',
                'Game cancelled due to too many player disconnecting..'
            );
       // }
    });
});

function checkGameStart() {
    if (Object.keys(users).length !== 5) {
        sendMessageToAllUsers(
            'warning',
            'glyphicon-warning-sign',
            'We require exactly five players to begin the game!'
        );
    } else {
        sendMessageToAllUsers(
            'info',
            'glyphicon-info-sign',
            'The game will start in 5s...'
        );
        setTimeout(assignCharacters, 500);
    }
}

function cleanUpGame() {
    game.inProgress = false;
    for (var name in users) {
        users[name].characterId = null;
    };
}

function assignCharacters() {
    clearInterval(startGameInterval);
    game.inProgress = true;

    sendMessageToAllUsers(
        'info',
        'glyphicon-info-sign',
        'Assigning everyone a character..'
    );

    var numPlayers = Object.keys(users).length;
    var numSpies = Math.ceil((1 / 3) * Object.keys(users).length);

    //Assign character cards
    var shuffledCharacters = shuffle(charactersInGame[numPlayers]);
    var characterCount = 0;
    for (var name in users) {
        users[name].characterId = shuffledCharacters[characterCount];
        characterCount++;
    };

    for (var name in users) {
        sendMessageToSpecificUser(
            name,
            'warning',
            'glyphicon-user',
            '<strong>You\'re ' + characters[users[name].characterId].name + '</strong> (' + ((characters[users[name].characterId].evil) ? 'Spy' : 'Resistance') + ')' +
            '<br>' + characters[users[name].characterId].desc + '<br><br>' + characters[users[name].characterId].pregame()
        );
    };

    game.round = 1;
    game.leader = 0;
    game.leadershipOrder = shuffle(Object.keys(users));

    sendMessageToAllUsers(
        'info',
        'glyphicon-info-sign',
        'The order of leadership is as follows: ' + game.leadershipOrder.join(' -> ')
    );

    sendTeamLeaderChooser(game.leadershipOrder[game.leader]);
}

function User(s) {
    this.socket = s;
    this.characterId = null;
    this.online = false;
}

function getOnlineUserCount() {
    var count = 0;
    for (var name in users) {
        if (users[name].online === true) {
            count++;
        }
    }
    return count;
}

function getSpies() {
    var spies = [];
    for (var name in users) {
        if ([2, 4].indexOf(users[name].characterId) !== -1) {
            spies.push(name);
        }
    }
    spies = shuffle(spies);
    return spies;
}

function shuffle(o) {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function sendMessageToAllUsers(type, icon, msg) {
    for (var name in users) {
        sendMessageToSpecificUser(name, type, icon, msg);
    };
}

function sendMessageToSpecificUser(name, type, icon, msg) {
    users[name].socket.emit('event_msg', JSON.stringify({
        type: type,
        icon: icon,
        msg: msg
    }));
}

function sendTeamLeaderChooser(name) {
    users[name].socket.emit('teamlead_msg', JSON.stringify({
        names: shuffle(Object.keys(users))
    }));

    sendMessageToAllUsers(
        'info',
        'glyphicon-info-sign',
        name + ' is now choosing ' + charactersInRound[Object.keys(users).length][game.round - 1] + ' people to go on the mission.'
    );
}

function sendVoteToAllUsers(msg) {
    for (var name in users) {
        if (users[name].characterId !== null) {
            sendVoteToSpecificUser(name, msg);
        }
    };
}

function sendVoteToSpecificUser(name, msg) {
    users[name].socket.emit('vote_msg', JSON.stringify({
        msg: msg
    }));
}