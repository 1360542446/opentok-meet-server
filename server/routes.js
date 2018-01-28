let OpenTok = require('opentok');
let express = require('express');
let co = require('co');

module.exports = function (app, config, redis, ot, redirectSSL) {
    var RoomStore = require('./roomstore.js')(redis, ot);
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
        var room = req.param('room');
        var callback = function (err, data) {
            if (err) {
                console.error('Error getting room: ', err);
                res.status(403).send({
                    message: err.message
                });
            } else {
                res.json(JSON.parse(data));
            }
        };
        RoomStore.getRoom(room, callback);
    });

    // Create room
    roomRoutes.post('/createroom', function (req, res) {
        var room = req.param('room');
        RoomStore.getRoom(room, function (err, data) {
            if (data) {
                res.json({ 'message': `room ${room} exits already` });
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
                        room: room,
                        sessionId: session.sessionId,
                        apiKey: config.apiKey,
                        p2p: RoomStore.isP2P(room)
                    }
                    // Store the room to sessionId mapping
                    RoomStore.createRoom(roomInfo, function (err, roomInfo) {
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
        var room = req.param('room');
        RoomStore.getRoom(room, function (err, data) {
            if (err) {
                console.error('Error getting room: ', err);
                res.status(403).send({
                    message: err.message
                });
            }

            if (data) {
                var roomInfo = JSON.parse(data);
                var newToken = Object.assign(roomInfo, {
                    token: ot.generateToken(roomInfo.sessionId, { role: 'publisher' })
                });
                res.json(newToken);
            }
        });
    });
};
