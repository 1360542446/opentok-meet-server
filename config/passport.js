let passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

// Setting jwt strategy
let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    secretOrKey: 'idonotknownow'
}
let jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {
    if (payload.email === 'admin@myenglishtutor.com') {
        done(null, {});
    }
    else {
        return done({ message: 'Unauthorized' }, false);
    }
});

passport.use('jwt', jwtLogin);