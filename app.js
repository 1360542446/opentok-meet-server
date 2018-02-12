let express = require('express'),
    fs = require('fs'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    app = express(),
    config;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

try {
    config = JSON.parse(fs.readFileSync('./config/config.json'));
} catch (err) {
    console.log('Error reading config.json');``
    process.exit();
}

require('./server/routes.js')(app, config);

// let glob = require('glob'),
//     path = require('path');

// glob.sync('./plugins/**/*.js').forEach(function (file) {
//     require(path.resolve(file))(app, config, ot);
// });

app.listen(config.port, function () {
    console.log('Listening on ' + config.port);
});

module.exports = app
