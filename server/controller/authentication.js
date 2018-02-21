let Bearer = require('jsonwebtoken');

module.exports = function (authRoutes, config) {
    generateToken = function (user) {
        return Bearer.sign(user, config.SecretKey, {
            expiresIn: 10080 // in seconds
        })
    }

    authRoutes.post('/login', function (req, res) {
        if (req.body.email === 'admin@myenglishtutor.com' && req.body.password === 'admin888') {
            let userInfo = { email: req.body.email };
            res.status(200).json({
                token: 'Bearer ' + generateToken(userInfo),
                user: userInfo
            });
        }
        else {
            res.status(403).send({
                message: 'Email not exits or Password is incorrect.'
            });
        }
    });
}