var OpenTok = require('opentok');

module.exports = function (redis, ot) {
    var roomStore = {
        isP2P: function (room) {
            return room.toLowerCase().indexOf('p2p') >= 0;
        },
        getRooms: function (callback) {
            redis.hkeys('rooms', callback);
        },
        getRoom: function (room, callback) {
            console.log('getRoom: ' + room);
            // Lookup the mapping of rooms to sessionIds
            redis.hget('rooms', room, function (err, sessionId) {
                if (!sessionId) {
                    callback({'message': `${room} not exits`})
                } else {
                    callback(null, sessionId);
                }
            });
        },
        createRoom: function (room, callback) {
            redis.hget('rooms', room, function (err, sessionId) {
                // not found
                if (err) {
                    var props = {
                        mediaMode: 'routed'
                    };
                    if (roomStore.isP2P(room)) {
                        props.mediaMode = 'relayed';
                    }
                    var otSDK = ot;
                    // Create the session
                    otSDK.createSession(props, function (err, session) {
                        if (err) {
                            callback(err);
                        } else {
                            var sessionId = session.sessionId;
                            // Store the room to sessionId mapping
                            redis.hset('rooms', room, sessionId, function (err) {
                                if (err) {
                                    console.error('Failed to set room', err);
                                    callback(err);
                                } else {
                                    callback(null, sessionId);
                                }
                            });
                        }
                    });
                }
                else{
                    callback({'message': `room ${room} exits already`});
                }
            });
        }
    };
    return roomStore;
};
