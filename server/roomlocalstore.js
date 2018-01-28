let OpenTok = require('opentok');
let fs = require('fs');
let roomFilePath = process.cwd() + '/data/rooms.json';

module.exports = function (ot) {
    let getAllRooms = () => JSON.parse(fs.readFileSync(roomFilePath));

    var roomStore = {
        isP2P: function (room) {
            return room.toLowerCase().indexOf('p2p') >= 0;
        },
        getRooms: function (callback) {
            callback(null, getAllRooms());
        },
        getRoom: function (room, callback) {
            console.log('getRoom: ' + room);
            let allRooms = getAllRooms();
            let roomInfo = allRooms.find((r) => r.name.toLowerCase() === room.toLowerCase());

            if (roomInfo) callback(null, roomInfo);
            else callback({ 'message': `${room} not exits` }, null);
        },
        createRoom: function (roomInfo, callback) {
            let allRooms = getAllRooms();
            if (!allRooms.find((r) => r.name.toLowerCase() === roomInfo.name.toLowerCase())) {
                allRooms.push(roomInfo);
                fs.writeFileSync(roomFilePath, JSON.stringify(allRooms, null, 4));

                callback(null);
            }
            else {
                callback({ 'message': `room created failed as ${err}` });
            }
        },
        addToken: function (room, tokenInfo, callback) {
            let allRooms = getAllRooms();
            let roomInfo = allRooms.find((r) => r.name.toLowerCase() === room.toLowerCase());
            if (roomInfo) {
                roomInfo.tokens.push(tokenInfo);
                fs.writeFileSync(roomFilePath, JSON.stringify(allRooms, null, 4));
                callback(null);

            } else {
                callback({ 'message': `token created failed as ${err}` });
            }
        }
    };
    return roomStore;
};
