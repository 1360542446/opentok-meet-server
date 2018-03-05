let passport = require('passport'),
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
let UserStore = require('./../server/store/userDynamostore')();

// Setting jwt strategy
let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    secretOrKey: 'idonotknownow'
}
let jwtUserLogin = new JwtStrategy(jwtOptions, function (payload, done) {
    if (payload.username) {
        UserStore.getUser(payload.username,function(err,data){
            if(data){
                return done(null, {});
            }
            return done({ message: 'Unauthorized' }, false);
        })
    }
    else {
        return done({ message: 'Unauthorized' }, false);
    }
});

passport.use('jwtUser', jwtUserLogin);