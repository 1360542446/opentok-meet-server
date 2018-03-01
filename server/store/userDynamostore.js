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
            console.log('remove user: ' + user);
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
        addToken: function (user, tokenInfo, callback) {
            var that = this;
            this.getUser(user, (err, data) => {
                if (err) callback({ 'message': `token created failed as ${err}` });
                else {
                    data.tokens.push(tokenInfo);
                    that.createUser(data, callback);
                }
            });
        },
        removeToken: function (user, token, callback) {
            var that = this;
            this.getUser(user, (err, data) => {
                if (err) callback({ 'message': `token remove failed as ${err}` });
                else {
                    var tokenInstance = data.tokens.find((t) => t.token.indexOf(token) > 0);
                    if (tokenInstance) {
                        data.tokens.splice(data.tokens.indexOf(tokenInstance), 1);
                        that.createUser(data, callback);
                    }
                }
            });
        },
    };
    return userStore;
};
