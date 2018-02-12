const AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/aws-config.json');
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
// const TableName = process.env.TABLE_NAME;
const TableName = 'Room';

module.exports = function () {
    var roomStore = {
        isP2P: function (room) {
            return room.toLowerCase().indexOf('p2p') >= 0;
        },
        getRooms: function (callback) {
            docClient.scan({ TableName }, function (err, data) {
                if (err) callback(err, null);
                else {
                    callback(null, data.Items);
                }
            });
        },
        getRoom: function (room, callback) {
            console.log('getRoom: ' + room);
            var params = {
                TableName,
                Key: { 'name': room }
            };
            docClient.get(params, function (err, data) {
                if (err) callback(err, null);
                else if (Object.keys(data).length === 0) {
                    callback({ 'message': `${room} not exits` }, null);
                }
                else {
                    callback(null, data.Item);
                }
            })
        },
        createRoom: function (roomInfo, callback) {
            var params = {
                TableName,
                Item: roomInfo
            };

            docClient.put(params, function (err, data) {
                if (err) {
                    callback({ 'message': `room created failed as ${err}` });
                } else {
                    callback(null);
                }
            });
        },
        removeRoom: function (room, callback) {
            console.log('remove room: ' + room);
            var params = {
                TableName,
                Key: { 'name': room }
            };

            docClient.delete(params, function (err, data) {
                if (err) {
                    callback({ 'message': `room created failed as ${err}` });
                } else {
                    callback(null);
                }
            });
        },
        addToken: function (room, tokenInfo, callback) {
            var that = this;
            this.getRoom(room, (err, data) => {
                if (err) callback({ 'message': `token created failed as ${err}` });
                else {
                    data.tokens.push(tokenInfo);
                    that.createRoom(data, callback);
                }
            });
        },
        removeToken: function (room, token, callback) {
            var that = this;
            this.getRoom(room, (err, data) => {
                if (err) callback({ 'message': `token remove failed as ${err}` });
                else {
                    var tokenInstance = data.tokens.find((t) => t.token.indexOf(token) > 0);
                    if(tokenInstance){
                        data.tokens.splice(data.tokens.indexOf(tokenInstance), 1);
                        that.createRoom(data, callback);
                    }
                }
            });
        },
    };
    return roomStore;
};
