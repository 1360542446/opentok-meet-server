let OpenTok = require('opentok'),
    express = require('express'),
    fs = require('fs');

let otConfig = JSON.parse(fs.readFileSync('./config/opentok-config.json'));
let ot = new OpenTok(otConfig.apiKey, otConfig.apiSecret);

let UserStore = require('./../store/userDynamostore')();
module.exports = function (userRoutes, config) {
    // Get users
    userRoutes.get('/', function (req, res) {
        UserStore.getUsers(function (err, usres) {
            if (err) res.status(400).send({ message: err.message });
            else res.json(usres);
        });
    })
    // Get user by username
    userRoutes.get('/:userName', function (req, res) {
        var userName = req.params.userName;
        var callback = function (err, data) {
            if (err) {
                console.error('Error getting user: ', err);
                res.status(403).send({
                    message: err.message
                });
            } else {
                res.json(data);
            }
        };
        UserStore.getUser(userName, callback);
    });

    // Delete user by name
    userRoutes.delete('/:userName', function (req, res) {
        var userName = req.params.userName;
        var callback = function (err, data) {
            if (err) {
                console.error('Error removing user: ', err);
                res.status(403).send({
                    message: err.message
                });
            } else {
                res.json({ message: 'ok' });
            }
        };
        UserStore.removeUser(userName, callback);
    });

    // Create user
    userRoutes.post('/', function (req, res) {
        var userName = req.body.userName;
        // console.log(userName)
        UserStore.getUser(userName, function (err, data) {
            if (data) {
                res.status(400).send({ 'message': `userName ${userName} exits already` });
                return;
            }
            var props = {
                mediaMode: 'routed'
            };
            if (UserStore.isP2P(userName)) {
                props.mediaMode = 'relayed';
            }

            // Create the session
            ot.createSession(props, function (err, session) {
                if (err) {
                    callback(err);
                } else {
                    var userInfo = {
                        userName: userName,
                        sessionId: session.sessionId,
                        apiKey: otConfig.apiKey,
                        p2p: UserStore.isP2P(user),
                        createTime: (new Date).toUTCString()
                    }
                    // Store the user to sessionId mapping
                    UserStore.createUser(userInfo, function (err, userName) {
                        if (err) {
                            console.error('Error creating user: ', err);
                            res.status(403).send({
                                message: err.message
                            });
                        } else {
                            res.json(userInfo);
                        }
                    });
                }
            });
        });
    });

    // generate a new password for a user
    // {
    //  userName:...,
    //  password: ...
    //}
    userRoutes.post('/:userName/password', function (req, res) {

    });
}   