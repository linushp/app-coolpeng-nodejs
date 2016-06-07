var async = require("async");
var models = require("../models/BlogModels");
var BlogPost = models.BlogPost;
var BlogTopic = models.BlogTopic;
var UserModel = models.UserModel;
var TagModel = models.TagModel;
var cpPage = require("./cp-page");


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
            },
            function(callback){
                //文章话题
                BlogTopic.find({}, callback).sort({ postCount : -1 });
            }
        ],
        function (err, result) {
            result = result||[];
            var m = {
                hotTagList:result[0]||[],
                hotPostList:result[1]||[],
                newPostList:result[2]||[],
                newReplyList:result[3]||[],
                recommendPostList:result[4]||[],
                topicList:result[5]||[]
            };
            callback0 && callback0(err,m);
        }
    );

}





function getBlogList(condition,pageNumber,pageSize,callback0){
    async.parallel([
            function (callback) {
                BlogPost.count(condition, callback);
            },
            function (callback) {
                BlogPost.find(condition, callback).sort({ createDate : -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);
            }
        ],
        function (err, result) {
            var recordCount = result[0];
            var postList = result[1] || []; //服务端渲染，不需要
            var pageCount = parseInt(recordCount / pageSize, 10);
            pageCount = (recordCount % pageSize === 0) ? pageCount : (pageCount + 1);

            if(pageNumber>pageCount){
                pageNumber = pageCount;
            }

            var layPageHTML = cpPage.toPagination({
                pageNumber: pageNumber,
                pageCount: pageCount || 1,
                linkRender: function (num, text, isEnable) {
                    return '<a class="cp-page-link" pn="'+num+'" >' + text + '</a>';
                }
            });

            callback0({
                postList: postList,
                pageTemplateString: layPageHTML
            });
        }
    );
}


exports.getBlogSidebar = getBlogSidebar;
exports.getBlogList = getBlogList;