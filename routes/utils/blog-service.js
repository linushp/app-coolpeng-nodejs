var async = require("async");
var models = require("../models/BlogModels");
var BlogPost = models.BlogPost;
var BlogTopic = models.BlogTopic;
var UserModel = models.UserModel;
var TagModel = models.TagModel;



function getBlogSidebar(callback0){


    async.parallel([
            function (callback) {
                //热门标签
                TagModel.find({}, callback).sort({ postCount : -1 }).limit(16);
            },
            function (callback) {
                //最热文章
                BlogPost.find({}, callback).sort({ viewCount : -1 }).limit(5);
            },
            function (callback) {
                //最新文章
                BlogPost.find({}, callback).sort({ createDate : -1 }).limit(5);
            },
            function (callback){
                //最近回复
                BlogPost.find({}, callback).sort({ lastCommentDate : -1 }).limit(5);
            },
            function(callback){
                //管理员推荐的
                BlogPost.find({isRecommend:true}, callback).sort({ recommendDate : -1 }).limit(4);
            }
        ],
        function (err, result) {
            result = result||[];
            var m = {
                hotTagList:result[0]||[],
                hotPostList:result[1]||[],
                newPostList:result[2]||[],
                newReplyList:result[3]||[],
                recommendPostList:result[4]||[]
            };
            callback0 && callback0(err,m);
        }
    );

}


exports.getBlogSidebar = getBlogSidebar;