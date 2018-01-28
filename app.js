let express = require('express'),
    OpenTok = require('opentok'),
    fs = require('fs'),
    app = express(),
    config;
// Enable CORS from client-side
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});

try {
    config = JSON.parse(fs.readFileSync('./config.json'));
} catch (err) {
    console.log('Error reading config.json');
    process.exit();
}

let redis = require('redis').createClient();
let ot = new OpenTok(config.apiKey, config.apiSecret);

require('./server/routes.js')(app, config, redis, ot);

let glob = require('glob'),
    path = require('path');

glob.sync('./plugins/**/*.js').forEach(function (file) {
    require(path.resolve(file))(app, config, redis, ot);
});

app.listen(config.port, function () {
    console.log('Listening on ' + config.port);
});
