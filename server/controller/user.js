const AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/aws-config.json');
const docClient = new AWS.DynamoDB.DocumentClient();
const TableName = 'User';
module.exports = function (userRoutes, config) {
    // Get users
    userRoutes.get('/', function (req, res) {
        docClient.scan({ TableName }, function (err, data) {
            if (err) { console.log('err', err) }
            else {
                console.log(data)
            }
        });
    });

    // Get user by username
    userRoutes.get('/:userName', function (req, res) {

    });

    // Delete user by name
    userRoutes.delete('/:userName', function (req, res) {

    });

    // Create user
    userRoutes.post('/', function (req, res) {

    });

    // generate a new password for a user
    // {
    //  userName:...,
    //  password: ...
    //}
    userRoutes.post('/:userName/password', function (req, res) {

    });
}   