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

    // Create user item.
    userRoutes.post('/', function (req, res) {
        var userName = req.body.userName;
        UserStore.getUser(userName, function (err, data) {
            if (data) {
                res.status(400).send({ 'message': `userName ${userName} exits already` });
                return;
            }

            var userInfo = {
                userName: userName
            }

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

        });
    });

    // generate a new password for a user
    // {
    //  userName:...,
    //  password: ...
    //}
    userRoutes.put('/', function (req, res) {
        var userName = req.body.userName;
        var password = req.body.password;
        var newPassword = req.body.newPassword;
        if (!password || !newPassword) {
            res.status(400).send({ 'message': `update password failed` });
            return;
        }
        var callback = function (err, data) {
            if (err) {
                res.send({ 'message': `update password failed` });
                return;
            } else if (data.password === password) {
                UserStore.update({ userName: userName, password: newPassword }, function (err, data) {
                    if (err) {
                        console.error(err);
                        res.send({ 'message': `update password failed` });
                    } else {
                        res.json(data);
                    }
                })
            } else {
                res.send({ 'message': `update password failed` });
                return;
            }
        }
        UserStore.getUser(userName, callback);
    });
}   