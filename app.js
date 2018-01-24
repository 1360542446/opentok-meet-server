let express = require('express'),
    OpenTok = require('opentok'),
    fs = require('fs'),
    app = express(),
    config;

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
