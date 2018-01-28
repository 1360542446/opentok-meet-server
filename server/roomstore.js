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
            redis.hget('rooms', room, function (err, data) {
                if (!data) {
                    callback({'message': `${room} not exits`})
                } else {
                    callback(null, data);
                }
            });
        },
        createRoom: function (roomInfo, callback) {
            redis.hget('rooms', roomInfo.room, function (err) {
                // not found
                if (!err) {
                    redis.hset('rooms', roomInfo.room, JSON.stringify(roomInfo), function (err) {
                        if (err) {
                            console.error('Failed to set room', err);
                            callback(err);
                        } else {
                            callback(null, roomInfo);
                        }
                    });
                }
                else{
                    callback({'message': `room created failed as ${err}`});
                }
            });
        }
    };
    return roomStore;
};
