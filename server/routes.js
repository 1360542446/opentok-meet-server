let OpenTok = require('opentok');
let express = require('express');

module.exports = function (app, config, redis, ot, redirectSSL) {
    var RoomStore = require('./roomstore.js')(redis, ot);
    var apiRoutes = express.Router();
    var roomRoutes = express.Router();
    apiRoutes.use('/room', roomRoutes);
    app.use('/api', apiRoutes);

    roomRoutes.get('/', function (req, res) {
        RoomStore.getRooms(function (err, rooms) {
            res.send(rooms);
        });
    });

    roomRoutes.get('/:room', function (req, res) {
        var room = req.param('room');
        var callback = function (err, sessionId) {
            if (err) {
                console.error('Error getting room: ', err);
                res.json({
                    error: err.message
                });
            } else {
                res.set({
                    'Access-Control-Allow-Origin': '*'
                });
                res.json({
                    room: room,
                    sessionId: sessionId,
                    apiKey: config.apiKey,
                    p2p: RoomStore.isP2P(room),
                    token: ot.generateToken(sessionId, {
                        role: 'publisher'
                    })
                });
            }
        };
        RoomStore.getRoom(room, callback);
    });

    roomRoutes.post('/', function (req, res) {
        var room = req.body.room;
        var callback = function (err, sessionId) {
            if (err) {
                console.error('Error creating room: ', err);
                res.json({
                    error: err.message
                });
            } else {
                res.set({
                    'Access-Control-Allow-Origin': '*'
                });
                res.json({
                    room: room,
                    sessionId: sessionId,
                    apiKey: config.apiKey,
                    p2p: RoomStore.isP2P(room),
                    token: ot.generateToken(sessionId, {
                        role: 'publisher'
                    })
                });
            }
        };
        RoomStore.createRoom(room, callback);
    });
};
