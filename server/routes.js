let OpenTok = require('opentok'),
    express = require('express'),
    passportService = require('../config/passport'),
    passport = require('passport');

// Middleware
let requireAuth = passport.authenticate('jwt', { session: false });

module.exports = function (app, config) {

    var apiRoutes = express.Router();
    app.use('/api', apiRoutes);

    var authRoutes = express.Router();
    apiRoutes.use('/auth', authRoutes);

    var authUserRoutes = express.Router();
    app.use('/user', authUserRoutes);

    var roomRoutes = express.Router();
    apiRoutes.use('/room', requireAuth, roomRoutes);

    var userRoutes = express.Router();
    apiRoutes.use('/user', userRoutes);

    require('./controller/authentication')(authRoutes, config);
    require('./controller/authrntivationUser')(authUserRoutes, config);
    require('./controller/room')(roomRoutes, config);
    require('./controller/user')(userRoutes, config);
};
