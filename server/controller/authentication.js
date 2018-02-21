let Bearer = require('jsonwebtoken');
let passportService = require('../../config/passport'),
passport = require('passport');

// Middleware
let requireAuth = passport.authenticate('jwt', { session: false });

module.exports = function (authRoutes, config) {
    generateToken = function (user) {
        return Bearer.sign(user, config.SecretKey, {
            expiresIn: 10080 // in seconds
        })
    }

    authRoutes.get('/health', requireAuth, function(req, res){
        res.status(200).json({message: 'ok'});
    });

    authRoutes.post('/login', function (req, res) {
        if (req.body.email === 'admin@myenglishtutor.eu' && req.body.password === 'E3*9j3@8uG01') {
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