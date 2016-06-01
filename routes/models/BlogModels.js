var mongoose = require('mongoose');
var dbUtil = require("./dbUtil");

var Schema = mongoose.Schema;   //  创建模型
var ObjectId = Schema.ObjectId;


var INDEX_STRING = {
    type: String,
    index: true
};
/**
 * 话题
 */
var BlogTopicSchema = new Schema({
    topicId:INDEX_STRING,
    title: INDEX_STRING,
    postCount:Number
}); //  定义了一个新的模型，但是此模式还未和users集合有关联

var BlogTopic = dbUtil.db.model('topic', BlogTopicSchema);



/**
 * 评论
 */
var Comment = new Schema();

Comment.add({
    title: INDEX_STRING,
    date: Date,
    content: String,
    comments: [Comment]
});


/**
 * 一篇文章
 */
var BlogPostSchema = new Schema({
    id: INDEX_STRING,
    topicId:INDEX_STRING,
    title: String,
    createTime: String,
    createUser: String,
    content: String,
    comments: [Comment],
    creator: Schema.ObjectId
}); //  定义了一个新的模型，但是此模式还未和users集合有关联

BlogPostSchema.statics.findByTitle = function (title, callback) {
    return this.find({title: title}, callback);
};


var BlogPost = dbUtil.db.model('post', BlogPostSchema); //  与users集合关联

BlogPost.addComment = function (blogId, data, callback) {
    //data = new Comment(data);
    BlogPost.update({_id: blogId}, {"$push": {"comments": data}}, callback);
};


BlogPost.getBlogPostCount = function(condition){
    return new Promise(function(resolve,reject){
        BlogPost.count(condition,function(err,doc){
            resolve(err,doc);
        });
    });
};


BlogPost.getBlogPostList = function(condition){
    return new Promise(function(resolve,reject){
        BlogPost.find(condition,function(err,doc){
            resolve(err,doc);
        });
    });
};


BlogPost.addOneComment = function (blogId, data) {
    return new Promise(function(resolve,reject){
        BlogPost.update({_id: blogId}, {"$push": {"comments": data}}, function(err,doc){
            resolve(err,doc);
        });
    });
};




exports.BlogPost = BlogPost;
exports.BlogTopic = BlogTopic;