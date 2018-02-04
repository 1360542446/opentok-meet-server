let OpenTok = require('opentok');
let express = require('express');

module.exports = function (app, config, ot, redirectSSL) {
    var RoomStore = require('./roomlocalstore.js')(ot);
    var apiRoutes = express.Router();
    var roomRoutes = express.Router();
    apiRoutes.use('/room', roomRoutes);
    app.use('/api', apiRoutes);

    // Get rooms
    roomRoutes.get('/', function (req, res) {
        RoomStore.getRooms(function (err, rooms) {
            res.send(rooms);
        });
    });

    // Get room by name
    roomRoutes.get('/getroom', function (req, res) {
        var room = req.query.room;
        var callback = function (err, data) {
            if (err) {
                console.error('Error getting room: ', err);
                res.status(403).send({
                    message: err.message
                });
            } else {
                res.json(data);
            }
        };
        RoomStore.getRoom(room, callback);
    });

    // Create room
    roomRoutes.post('/createroom', function (req, res) {
        var room = req.query.room;
        RoomStore.getRoom(room, function (err, data) {
            if (data) {
                res.status(400).send({ 'message': `room ${room} exits already` });
                return;
            }
            var props = {
                mediaMode: 'routed'
            };
            if (RoomStore.isP2P(room)) {
                props.mediaMode = 'relayed';
            }

            // Create the session
            ot.createSession(props, function (err, session) {
                if (err) {
                    callback(err);
                } else {
                    var roomInfo = {
                        name: room,
                        sessionId: session.sessionId,
                        apiKey: config.apiKey,
                        p2p: RoomStore.isP2P(room),
                        createTime: (new Date).toUTCString(),
                        tokens: []
                    }
                    // Store the room to sessionId mapping
                    RoomStore.createRoom(roomInfo, function (err, room) {
                        if (err) {
                            console.error('Error creating room: ', err);
                            res.status(403).send({
                                message: err.message
                            });
                        } else {
                            res.json(roomInfo);
                        }
                    });
                }
            });
        });
    });

    // generate a new token for a room
    roomRoutes.get('/generateToken', function (req, res) {
        var user = req.query.user;
        var room = req.query.room;
        var expireTime = req.query.expire;
        RoomStore.getRoom(room, function (err, roomInfo) {
            if (err) {
                console.error('Error getting room: ', err);
                res.status(403).send({
                    message: err.message
                });
            }

            if (roomInfo) {
                var defaultExpireTime = (new Date().getTime() / 1000) + (7 * 24 * 60 * 60); // in one week
                if (expireTime) {
                    defaultExpireTime = (new Date().getTime() / 1000) + (parseInt(expireTime) * 24 * 60 * 60);
                }
                var newTokenOption = {
                    role: 'publisher',
                    expireTime: defaultExpireTime
                }
                var token = ot.generateToken(roomInfo.sessionId, newTokenOption);
                var newToken = Object.assign({}, newTokenOption, { token });
                newToken.expireTime = new Date(newToken.expireTime * 1000).toUTCString();
                newToken.user = user || '';

                RoomStore.addToken(room, newToken, (err) => {
                    if (err) {
                        console.error('Error creating token: ', err);
                        res.status(403).send({
                            message: err.message
                        });
                    } else {
                        res.json(newToken);
                    }
                });
            }
        });
    });
};
