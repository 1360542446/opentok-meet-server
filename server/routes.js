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

    var roomRoutes = express.Router();
    apiRoutes.use('/room', requireAuth, roomRoutes);

    require('./controller/authentication')(authRoutes, config);
    require('./controller/room')(roomRoutes, config);
};
