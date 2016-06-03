var express = require('express');
var _ = require("underscore");
var async = require("async");
var router = express.Router();
var BlogPost = require("./models/BlogModels").BlogPost;
var BlogTopic = require("./models/BlogModels").BlogTopic;
var cpPage = require("./utils/cp-page");
var cpUtil = require("./utils/cp-util");
var toJsPostList = cpUtil.toJsPostList;


/**
 * 博客首页
 * @param req
 * @param res
 * @param next
 * @constructor
 */
function PostIndex(req, res, next) {


    var pageNumber = parseInt(req.query.pn || "1", 10);
    if (pageNumber < 1) {
        pageNumber = 1;
    }
    var pageSize = 20;

    var condition = {};

    async.parallel([
            function (callback) {
                BlogTopic.find(callback);
            },
            function (callback) {
                BlogPost.count(condition, callback);
            },
            function (callback) {
                BlogPost.find(condition, callback).sort({ createDate : -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);
            }
        ],
        function (err, result) {
            var topicList = result[0];
            var recordCount = result[1];
            var postList = toJsPostList(result[2] || [], true);

            var pageCount = parseInt(recordCount / pageSize, 10);
            pageCount = (recordCount % pageSize === 0) ? pageCount : (pageCount + 1);

            var layPageHTML = cpPage.toPagination({
                pageNumber: pageNumber,
                pageCount: pageCount || 1,
                linkRender: function (num, text, isEnable) {
                    return '<a class="ajax-link" ajax-target=".main-body" href="/blog/?pn=' + num + '" >' + text + '</a>';
                }
            });

            res.smartRender('blog/index', {
                title: 'Express',
                topicList: topicList,
                postList: postList,
                postListPage: layPageHTML
            });

        }
    );

}


/**
 * 查看一篇具体的文章
 * @param req
 * @param res
 * @param next
 * @constructor
 */
function PostViewByID(req, res, next) {
    var id = req.params.id;

    BlogPost.find({_id: id}, function (err, doc) {
        if (doc && doc.length > 0) {
            var postList = toJsPostList(doc, false);
            var post = postList[0];
            res.smartRender(['blog/post', "blog/post-content"], {title: 'Express', post: post});
        } else {
            res.smartRender(['blog/post', "blog/post-content"], {title: 'Express', post: {title: "没有找到"}});
        }
    });


}


/**
 * 进入到新建帖子页面
 * @param req
 * @param res
 * @param next
 * @constructor
 */
function CreatePost(req, res, next) {

    BlogTopic.find(function(err,doc){
        var topicList = doc||[];
        res.smartRender('blog/post-create', {
            title: '创建帖子',
            topicList:topicList
        });
    });



}


/**
 * 修改或新建一篇帖子
 * @param req
 * @param res
 * @param next
 * @constructor
 */
function CreatePostSubmit(req, res, next) {
    var loginUser = req.session.loginUser;
    if(!cpUtil.isPermissionCreatePost(req)){
        res.end("no permission");
        return;
    }

    var data = req.body;
    if(!data){
        res.end("content is empty","utf-8");
        return;
    }

    var tagString = data.tagString||"";
    tagString = tagString.trim();
    var tags = tagString.split(",");
    tags = _.reject(tags,function(v){return (!v|| v.length===0 || v.trim().length===0)});

    //修改
    if(data.id && data.id.length > 0 ){

        var updateData = {
            "$set":{
                title:data.title,
                content:data.content,
                contentSummary:data.contentSummary,
                updateTime:cpUtil.dataFormat(),
                updateDate:new Date(),
                updateUserNickName:loginUser.nickname,
                updateUserAvatar:loginUser.avatar,
                tags:tags,
                belongTopicId:data.belongTopicId
            }
        };

        BlogPost.update({_id:data.id},updateData,function(e,r){
            if(e){
                res.end("err");
            }else {
                res.end("ok");
            }
        });
    }
    else {

        data.createTime = cpUtil.dataFormat();
        data.createDate = new Date() ;
        data.createUserNickName = loginUser.nickname;
        data.createUserAvatar = loginUser.avatar;
        data.viewCount = 0;
        data.replyCount = 0;
        data.tags = tags;

        //新建
        var post = new BlogPost(data);
        post.save(post, function (e, r) {
            if (e) {
                res.end("err");
            } else {
                res.end("ok");
            }
        });
    }
}


/**
 * 创建帖子的回复提交
 * @param req
 * @param res
 * @param next
 * @constructor
 */
function CreatePostComment(req, res, next){

    var id = req.params.id;
    var loginUser = req.session.loginUser || {};
    var content = req.body.content;

    BlogPost.find({_id: id}, function (err, doc) {

        if (err || !doc || doc.length === 0) {
            res.end("没有找到此文章，可能已经被删除了。");
            return;
        }

        var post = doc[0];
        var replyCount = post.replyCount || 0;
        replyCount++;


        BlogPost.update({_id: id}, {"$set": {replyCount: replyCount}}, function (err, d) {

            if (err) {
                res.end("更新帖子数据失败");
                return;
            }

            BlogPost.addComment(id, {
                title: "",
                content: content,
                date: new Date(),
                createTime: cpUtil.dataFormat(),
                createUserNickName: loginUser.nickname,
                createUserAvatar: loginUser.avatar,
                floorNumber: replyCount
            }, function (err, r) {
                if (err) {
                    res.send(err.toString());
                    res.end();
                } else {
                    res.send("ok");
                    res.end();
                }
            });

        });

    });


}

/**
 * 首页
 */
router.get('/', PostIndex);

/**
 * 查看具体一篇文章
 */
router.get('/post/:id', PostViewByID);


/**
 * 进入到新建帖子页面
 */
router.get('/post-create', CreatePost);


/**
 * 提交新建一篇文件
 */
router.post('/post-create', CreatePostSubmit);


/**
 * 给一篇文章添加评论
 */
router.post('/post-comment/:id', CreatePostComment);


/**
 * 删除一篇文章
 */
router.get('/post-delete/:postId', function (req, res, next) {

});


/**
 * 删除一篇文章的评论
 */
router.get('/post-comment-delete/:postId/:commentId', function (req, res, next) {

});


module.exports = router;