var mongoose = require('mongoose');
var dbUtil = require("./dbUtil");
var _ = require("underscore");

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
 * 用户
 */
var UserSchema = new Schema({
    nickname:String,
    email: String,
    loginCount:Number,
    avatar:String,
    loginTimes:[String]
}); //  定义了一个新的模型，但是此模式还未和users集合有关联


var UserModel = dbUtil.db.model('user', UserSchema); //  与users集合关联








/**
 * 标签
 */
var TagSchema = new Schema({
    title:INDEX_STRING,
    postCount:Number
}); //  定义了一个新的模型，但是此模式还未和users集合有关联


var TagModel = dbUtil.db.model('tag', TagSchema); //  与users集合关联

TagModel.saveTagOrIncrementPostCount = function(title,callback){
    TagModel.find({title:title},function(err,doc){
        if(err){
            callback && callback(err,doc,"find");
            return;
        }
        if(doc && doc.length>0){
            var d = doc[0];
            var postCount = d.postCount||0;
            TagModel.update({_id: d._id},{
                postCount:(postCount+1)
            },function(err,doc){
                callback && callback(err,doc,"update");
            });
        }else {
            var m = new TagModel({title:title,postCount:0});
            m.save(m,function(err,doc){
                callback && callback(err,doc,"save");
            });
        }
    });
};

TagModel.batchSaveTagOrIncrementPostCount = function(titleList,callback){
    if(_.isArray(titleList) && titleList.length > 0){
        for (var i = 0; i < titleList.length; i++) {
            var title = titleList[i];
            TagModel.saveTagOrIncrementPostCount(title,function(){
            });
        }
    }
};

TagModel.getTopNumTags = function(num,callback){
    TagModel.find(callback).sort({"postCount":-1}).limit(num);
};

















/**
 * 评论
 */
var Comment = new Schema();

Comment.add({
    title: INDEX_STRING,
    content: String,
    comments: [Comment],
    createTime: String,
    createDate: Date,
    createUserNickName: String,
    createUserAvatar:String,
    createUserRole:String,
    floorNumber:Number
});


/**
 * 一篇文章
 */
var BlogPostSchema = new Schema({
    id: INDEX_STRING,
    topicId:INDEX_STRING,
    title: String,
    content: String,
    contentSummary: String,

    comments: [Comment],
    lastComment:Comment, //最近一个回复
    lastCommentDate:Date,
    createTime: String,
    createDate: Date,
    createUserEmail: String,
    createUserNickName: String,
    createUserAvatar:String,

    updateTime: String,
    updateDate: Date,
    updateUserNickName: String,
    updateUserAvatar:String,

    viewCount:Number,
    replyCount:Number,
    likeCount:Number,
    tags:[String],
    tagString:String,
    belongTopicId:String,
    belongTopicTitle:String,
    isRecommend:Boolean,//是否被推荐
    recommendDate:Date,//被推荐的时间
    creator: Schema.ObjectId
}); //  定义了一个新的模型，但是此模式还未和users集合有关联

BlogPostSchema.statics.findByTitle = function (title, callback) {
    return this.find({title: title}, callback);
};


var BlogPost = dbUtil.db.model('post', BlogPostSchema); //  与users集合关联

BlogPost.addComment = function (blogId, data, callback) {
    BlogPost.update({_id: blogId}, {
        "$push": {"comments": data},
        "$set":{"lastComment":data,"lastCommentDate":new Date()}
    }, callback);
};


//BlogPost.getBlogPostCount = function(condition){
//    return new Promise(function(resolve,reject){
//        BlogPost.count(condition,function(err,doc){
//            resolve(err,doc);
//        });
//    });
//};
//
//
//BlogPost.getBlogPostList = function(condition){
//    return new Promise(function(resolve,reject){
//        BlogPost.find(condition,function(err,doc){
//            resolve(err,doc);
//        });
//    });
//};
//
//
//BlogPost.addOneComment = function (blogId, data) {
//    return new Promise(function(resolve,reject){
//        BlogPost.update({_id: blogId}, {"$push": {"comments": data}}, function(err,doc){
//            resolve(err,doc);
//        });
//    });
//};




exports.BlogPost = BlogPost;
exports.BlogTopic = BlogTopic;
exports.UserModel = UserModel;
exports.TagModel = TagModel;