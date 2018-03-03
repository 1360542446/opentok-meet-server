const AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/aws-config.json');
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
// const TableName = process.env.TABLE_NAME;
const TableName = 'User';

module.exports = function () {
    var userStore = {
        getUsers: function (callback) {
            docClient.scan({ TableName }, function (err, data) {
                if (err) callback(err, null);
                else {
                    callback(null, data.Items);
                }
            });
        },
        getUser: function (userName, callback) {
            var params = {
                TableName,
                Key: { 'userName': userName }
            };
            docClient.get(params, function (err, data) {
                if (err) callback(err, null);
                else if (Object.keys(data).length === 0) {
                    callback({ 'message': `${userName} not exits` }, null);
                }
                else {
                    callback(null, data.Item);
                }
            })
        },
        createUser: function (userInfo, callback) {
            var params = {
                TableName,
                Item: userInfo
            };

            docClient.put(params, function (err, data) {
                if (err) {
                    callback({ 'message': `user created failed as ${err}` });
                } else {
                    callback(null);
                }
            });
        },
        removeUser: function (user, callback) {
            var params = {
                TableName,
                Key: { 'userName': user }
            };

            docClient.delete(params, function (err, data) {
                if (err) {
                    callback({ 'message': `user created failed as ${err}` });
                } else {
                    callback(null);
                }
            });
        },
        update: function (user, callback) {
            var params = {
                TableName: TableName,
                Key: {
                    "userName": user.userName
                },
                UpdateExpression: "set password=:p",
                ExpressionAttributeValues: {
                    ":p": user.password
                },
                ReturnValues: "UPDATED_NEW"
            };
            docClient.update(params, (err, data) => {
                callback(err, data);
            });
        }
    };
    return userStore;
};
