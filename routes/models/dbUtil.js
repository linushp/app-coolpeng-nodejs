var mongoose = require('mongoose');
var appConfig = require('../../app-config');

var db = mongoose.createConnection(appConfig.MONGOOSE_CONNECTION);//；连接数据库
db.on('error', function(error) {
    console.log(error);
});

exports.db = db;