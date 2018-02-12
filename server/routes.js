let OpenTok = require('opentok'),
    express = require('express'),
    fs = require('fs');

let otConfig = JSON.parse(fs.readFileSync('./config/opentok-config.json'));
let ot = new OpenTok(otConfig.apiKey, otConfig.apiSecret);
let RoomStore = null;

module.exports = function (app, config) {
    if (config.storage && config.storage[0]) {
        switch (config.storage[0]) {
            case "dynamo":
                RoomStore = require('./dynamostore')();
                break;
            case "local":
                RoomStore = require('./roomlocalstore.js')();
                break;
            case "redis":
                break;
        }
    }

    var apiRoutes = express.Router();
    var roomRoutes = express.Router();
    apiRoutes.use('/room', roomRoutes);
    app.use('/api', apiRoutes);

    // Get rooms
    roomRoutes.get('/', function (req, res) {
        RoomStore.getRooms(function (err, rooms) {
            if (err) res.status(400).send({ message: err.message });
            else res.json(rooms);
        });
    });

    // Get room by name
    roomRoutes.get('/:room', function (req, res) {
        var room = req.params.room;
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

    // Get room by name
    roomRoutes.delete('/:room', function (req, res) {
        var room = req.params.room;
        var callback = function (err, data) {
            if (err) {
                console.error('Error removing room: ', err);
                res.status(403).send({
                    message: err.message
                });
            } else {
                res.json({ message: 'ok' });
            }
        };
        RoomStore.removeRoom(room, callback);
    });

    // Create room
    roomRoutes.post('/', function (req, res) {
        var room = req.body.room;
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
                        apiKey: otConfig.apiKey,
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
    // {
    //  user:...,
    //  expireTime: ...
    //}
    roomRoutes.post('/:room/generateToken', function (req, res) {
        var room = req.params.room;
        var roomRequestBody = req.body;
        RoomStore.getRoom(room, function (err, roomInfo) {
            if (err) {
                console.error('Error getting room: ', err);
                res.status(403).send({
                    message: err.message
                });
            }

            if (roomInfo) {
                var defaultExpireTime = (new Date().getTime() / 1000) + (7 * 24 * 60 * 60); // in one week
                if (roomRequestBody.expireTime) {
                    defaultExpireTime = (new Date().getTime() / 1000) + (parseInt(roomRequestBody.expireTime) * 24 * 60 * 60);
                }
                var newTokenOption = {
                    role: 'publisher',
                    expireTime: defaultExpireTime
                }
                var token = ot.generateToken(roomInfo.sessionId, newTokenOption);
                var newToken = Object.assign({}, newTokenOption, { token });
                newToken.expireTime = new Date(newToken.expireTime * 1000).toUTCString();
                newToken.user = roomRequestBody.user || '';

                RoomStore.addToken(room, newToken, (err) => {
                    if (err) {
                        console.error('Error creating token: ', err);
                        res.status(403).send({
                            message: err.message
                        });
                    } else {
                        res.json({ message: 'ok' });
                    }
                });
            }
        });
    });

    // remove existing token
    roomRoutes.delete('/:room/token/:token', function (req, res) {
        var room = req.params.room;
        var token = req.params.token;
        RoomStore.removeToken(room, token, function (err, data) {
            if (err) {
                console.error('Error removing token: ', err);
                res.status(403).send({
                    message: err.message
                });
            } else {
                res.json({ message: 'ok' });
            }
        });
    });
};
