var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost:27017/helloworld');//；连接数据库
db.on('error', function(error) {
    console.log(error);
});
var Schema = mongoose.Schema;   //  创建模型
var ObjectId = Schema.ObjectId;

var topicSchema  = new Schema({
    id: String,
    title: String
}); //  定义了一个新的模型，但是此模式还未和users集合有关联
exports.Topic = db.model('topic', topicSchema); //  与users集合关联