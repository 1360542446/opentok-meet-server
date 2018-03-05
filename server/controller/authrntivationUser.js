let Bearer = require('jsonwebtoken');
let passportService = require('../../config/passportUser');
let passport = require('passport');
let UserStore = require('./../store/userDynamostore')();
let RoomStore = require('./../store/dynamostore')();

// Middleware
let requireAuth = passport.authenticate('jwtUser', { session: false });

module.exports = function (authUserRoutes, config) {
    generateToken = function (user) {
        return Bearer.sign(user, config.SecretKey, {
            expiresIn: 10080 // in seconds
        })
    }

    authUserRoutes.get('/health', requireAuth, function (req, res) {
        res.status(200).json({ message: 'ok' });
    });

    authUserRoutes.post('/login', function (req, res) {
        let room = req.body.room;
        let userName = req.body.username;
        let password = req.body.password;

        var callback = function (err, data) {
            if (err) {
                console.error('Error getting user: ', err);
                res.status(403).send({
                    message: err.message
                });
            } else if (data.password === password) {
                RoomStore.getRoom(room, function (err, data) {
                    if (err) {
                        console.error('Error getting room: ', err);
                        res.status(403).send({
                            message: err.message
                        });
                    } else {
                        if (data['tokens'] && data['tokens'].length > 0) {
                            for (let obj of data['tokens']) {
                                if (obj['user'] === userName) {
                                    let userInfo = { username: userName };
                                        res.status(200).json({
                                            token: 'Bearer ' + generateToken(userInfo),
                                            username: userInfo,
                                            room:data['name'],
                                            apiKey:data['apikey'],
                                            sessionId:data['sessionId'],
                                            token:data['token']
                                        });
                                    return;
                                }
                            }
                            res.status(403).send({
                                message: `no room for ${userName}`
                            });
                        }
                    }
                })
            } else {
                res.send('login failed!')
            }
        };
        UserStore.getUser(userName, callback);

    });
}