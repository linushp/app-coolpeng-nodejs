var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost:27017/helloworld');//；连接数据库
db.on('error', function(error) {
    console.log(error);
});
var Schema = mongoose.Schema;   //  创建模型
var ObjectId = Schema.ObjectId;


var Comment = new Schema();

Comment.add({
    title: {
        type: String,
        index: true
    },
    date: Date,
    body: String,
    comments: [Comment]
});


var postSchema  = new Schema({
    id: String,
    title: String,
    createTime:String,
    createUser:String,
    content:String,
    comments: [Comment],
    creator: Schema.ObjectId
}); //  定义了一个新的模型，但是此模式还未和users集合有关联
exports.Post = db.model('post', postSchema); //  与users集合关联