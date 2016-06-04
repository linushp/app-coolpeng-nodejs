var mongoose = require('mongoose');
var appConfig = require('../../app-config');

var options = {
    server: {
        auto_reconnect: true,
        poolSize: 10
    }
};

var db = mongoose.createConnection(appConfig.MONGOOSE_CONNECTION,options);//；连接数据库
db.on('error', function(error) {
    console.log(error);
});

exports.db = db;