var express = require('express');
var _ = require("underscore");
var async = require("async");
var router = express.Router();
var BlogPost = require("./models/BlogModels").BlogPost;
var BlogTopic = require("./models/BlogModels").BlogTopic;
var TagModel = require("./models/BlogModels").TagModel;
var cpPage = require("./utils/cp-page");
var cpUtil = require("./utils/cp-util");
var blogService = require("./utils/blog-service");
var toJsPostList = cpUtil.toJsPostList;

// GET      /article/view/:id
function articleView(req, res, next) {
    var id = req.params.id;

    BlogPost.find({_id: id}, function (err, doc) {
        if (doc && doc.length > 0) {
            var post = doc[0];
            res.renderWithSidebar('blog/post', {title: post.title, post: post});
        } else {
            res.renderWithSidebar('blog/post', {title: "Not Found", post: {title: "Not Found"}});
        }
    });
}

//GET      /article/create
function articleCreateGet(req, res, next) {
    BlogTopic.find(function(err,doc){
        var topicList = doc||[];
        res.renderWithSidebar('blog/post-create', {
            title: '创建帖子',
            topicList:topicList
        });
    });
}

//POST      /article/create
function articleCreateSave(req, res, next) {
    var loginUser = req.session.loginUser;
    if (!cpUtil.isPermissionCreatePost(req)) {
        res.end("no permission");
        return;
    }

    var data = req.body;
    if (!data) {
        res.end("content is empty");
        return;
    }

    var tagString = data.tagString || "";
    tagString = tagString.trim();
    var tags = tagString.split(",");
    tags = _.reject(tags, function (v) {
        return (!v || v.length === 0 || v.trim().length === 0)
    });


    data.createTime = cpUtil.dataFormat();
    data.createDate = new Date();
    data.createUserNickName = loginUser.nickname;
    data.createUserAvatar = loginUser.avatar;
    data.viewCount = 0;
    data.replyCount = 0;
    data.likeCount = 0;
    data.tags = tags;
    data.isRecommend = data.isRecommend || false;

    //新建
    var post = new BlogPost(data);
    post.save(post, function (e, r) {
        if (e) {
            res.end("err");
        } else {
            res.end("ok");
        }
    });

    TagModel.batchSaveTagOrIncrementPostCount(tags);

}
//GET     /article/modify/:id
function articleModifyGet(req, res, next) {

    var articleId = req.params.id;

    async.parallel([
        function(callback){
            BlogTopic.find(callback);
        },
        function(callback){
            BlogPost.find({_id:articleId},callback);
        }
    ],function(err,result){
        var topicList = result[0]||[];
        var postList = result[1];
        if (postList && postList.length > 0){
            var post = postList[0];
            res.renderWithSidebar('blog/post-create', {
                title: '创建帖子',
                topicList:topicList,
                post:post
            });
        }else{
            res.end("post is not Found")
        }
    });


}

//POST     /article/modify/:id
function articleModifySave(req, res, next) {

    var loginUser = req.session.loginUser;
    if (!cpUtil.isPermissionCreatePost(req)) {
        res.end("no permission");
        return;
    }

    var data = req.body;
    if (!data) {
        res.end("content is empty");
        return;
    }

    var articleId = req.params.id || data.id;
    if (!articleId) {
        res.end("articleId is empty");
        return;
    }

    var tagString = data.tagString || "";
    tagString = tagString.trim();
    var tags = tagString.split(",");
    tags = _.reject(tags, function (v) {
        return (!v || v.length === 0 || v.trim().length === 0)
    });


    var updateData = {
        "$set": {
            title: data.title,
            content: data.content,
            contentSummary: data.contentSummary,
            updateTime: cpUtil.dataFormat(),
            updateDate: new Date(),
            updateUserNickName: loginUser.nickname,
            updateUserAvatar: loginUser.avatar,
            tags: tags,
            belongTopicId: data.belongTopicId,
            belongTopicTitle: data.belongTopicTitle
        }
    };

    BlogPost.update({_id: articleId}, updateData, function (e, r) {
        if (e) {
            res.end("err");
        } else {
            res.end("ok");
        }
    });

}

// * GET      /article/delete/:id
function articleDelete(req, res, next) {
    var articleId = req.params.id;
    BlogPost.remove({_id:articleId},function(e, r){
        if (e) {
            res.end("err");
        } else {
            res.end("ok");
        }
    });
}

// GET     /article/comment/page/:postId?pn=0  分页查看回复
function articleCommentGet(req, res, next) {
    var articleId = req.params.postId;
    var pn = req.query.pn;
    //TODO
}

// POST     /article/comment/create/:postId        创建一个新回复
function articleCommentCreate(req, res, next) {
    var articleId = req.params.postId;

    var id = req.params.postId;
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
                createDate: new Date(),
                createTime: cpUtil.dataFormat(),
                createUserNickName: loginUser.nickname,
                createUserAvatar: loginUser.avatar,
                createUserRole:loginUser.role,
                floorNumber: replyCount
            }, function (err, r) {
                if (err) {
                    res.end(err.toString());
                } else {
                    res.end("ok");
                }
            });
        });
    });
}

// GET      /article/comment/delete/:postId/:commentId  删除一个新回复
function articleCommentDelete(req, res, next) {
    var articleId = req.params.postId;
    var commentId = req.params.commentId;
    //TODO
}

router.get('/view/:id',articleView);

router.get('/create',articleCreateGet);

router.post('/create',articleCreateSave);

router.get('/modify/:id',articleModifyGet);

router.post('/modify/:id',articleModifySave);

router.get('/delete/:id',articleDelete);

router.get('/comment/page/:postId',articleCommentGet);

router.post('/comment/create/:postId',articleCommentCreate);

router.get('/comment/delete/:postId/:commentId',articleCommentDelete);

module.exports = router;

/**
 *
 * GET      /article/view/:id
 * POST     /article/create
 * GET      /article/create
 * GET      /article/modify/:id
 * POST     /article/modify/:id
 * GET      /article/delete/:id
 *
 * GET     /article/comment/page/:postId?pn=0  分页查看回复
 * POST     /article/comment/create/:postId        创建一个新回复
 * GET      /article/comment/delete/:postId/:commentId  删除一个新回复
 *
 */