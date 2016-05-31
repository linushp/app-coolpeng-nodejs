var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost:27017/helloworld');//；连接数据库
db.on('error', function(error) {
    console.log(error);
});


exports.db = db;