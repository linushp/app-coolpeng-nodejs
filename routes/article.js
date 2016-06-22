var express = require('express');
var _ = require("underscore");
var path = require('path');
var fs = require("fs");
var async = require("async");
var router = express.Router();
var BlogPost = require("./models/BlogModels").BlogPost;
var BlogTopic = require("./models/BlogModels").BlogTopic;
var TagModel = require("./models/BlogModels").TagModel;
var cpPage = require("./../public/all-stack/cp-page");
var cpUtil = require("./utils/cp-util");
var blogService = require("./utils/blog-service");
var toJsPostList = cpUtil.toJsPostList;
var appConfig = require('../app-config');

// GET      /article/view/:id
function articleView(req, res, next) {
    var id = req.params.id;

    BlogPost.find({_id: id}, function (err, doc) {
        if (doc && doc.length > 0) {
            var post = doc[0];
            var comments = post.comments || [];
            for (var i = 0; i < comments.length; i++) {
                var obj = comments[i];
                if (!obj.createUserAvatar) {
                    obj.createUserAvatar = appConfig.DEFAULT_AVATAR;
                }
            }
            var viewCount = post.viewCount || 0;
            BlogPost.update({_id: id}, {"$set": {"viewCount": viewCount+1}}, function (err, doc) {
                res.renderWithSidebar('blog/post', {title: post.title, post: post});
            });
        } else {
            res.renderWithSidebar('blog/post', {title: "Not Found", post: {title: "Not Found"}});
        }
    });
}

//GET      /article/create
function articleCreateGet(req, res, next) {
    async.parallel([
        function(callback){
            BlogTopic.find(callback);
        },
        function (callback) {
            //读取模板
            var filePath = path.join(appConfig.ROOT_DIR, "/views/blog/post-create-footer.html");
            fs.readFile(filePath, "utf-8", callback);
        }
    ],function(err,result){
        var topicList = result[0]||[];
        var PAGE_FOOTER = result[1] || "";
        res.renderWithSidebar('blog/post-create', {
            title: '创建帖子',
            isCreatePost:true,
            isModifyPost:false,
            topicList:topicList,
            PAGE_FOOTER:PAGE_FOOTER.toString(),
            post:{
                title:"",
                content:"",
                belongTopicId:"",
                tagString:""
            }
        });
    });

}

//POST      /article/create
function articleCreateSave(req, res, next) {
    if (!cpUtil.isPermissionCreatePost(req)) {
        res.end("no permission");
        return;
    }
    var loginUser = req.session.loginUser;
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
    data.createUserEmail = loginUser.email;
    data.viewCount = 0;
    data.replyCount = 0;
    data.likeCount = 0;
    data.tags = tags;
    data.tagString = tags.join(",");
    data.isRecommend = data.isRecommend || false;

    //新建
    var post = new BlogPost(data);

    //for (var i = 0; i < 1000; i++) {
    //    var post0 = new BlogPost(data);
    //    post0.save(post0, function (e, r) {
    //    });
    //}

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

    if (!cpUtil.isPermissionCreatePost(req)) {
        res.end("no permission");
        return;
    }

    var articleId = req.params.id;

    async.parallel([
        function(callback){
            BlogTopic.find(callback);
        },
        function(callback){
            BlogPost.find({_id:articleId},callback);
        },
        function (callback) {
            //读取模板
            var filePath = path.join(appConfig.ROOT_DIR, "/views/blog/post-create-footer.html");
            fs.readFile(filePath, "utf-8", callback);
        }
    ],function(err,result){
        var topicList = result[0]||[];
        var postList = result[1];
        if (postList && postList.length > 0){
            var post = postList[0];
            var tags = post.tags || [];
            post.tagString = tags.join(" , ");
            var PAGE_FOOTER = result[2] || "";
            res.renderWithSidebar('blog/post-create', {
                title: '修改文章',
                topicList:topicList,
                post:post,
                isCreatePost:false,
                isModifyPost:true,
                PAGE_FOOTER:PAGE_FOOTER.toString()
            });
        }else{
            res.end("post is not Found")
        }
    });


}

//POST     /article/modify/:id
function articleModifySave(req, res, next) {

    if (!cpUtil.isPermissionCreatePost(req)) {
        res.end("no permission");
        return;
    }

    var loginUser = req.session.loginUser;

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
            tagString:tags.join(","),
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

    if (!cpUtil.isPermissionCreatePost(req)) {
        res.end("err_no_permission");
        return;
    }


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
    var loginUser = req.session.loginUser || {};
    var content = req.body.content ||"";
    content = content.toString().trim();

    if(content.length===0){
        res.end("err_no_reply");//没有填写评论内容
        return;
    }

    if(content.length>300){
        res.end("err_reply_too_long");
        return;
    }

    if(!loginUser.isLogin){
        res.end("err_no_login");//用户没有登录
        return;
    }

    var currentTime = new Date().getTime();
    if(loginUser.articleCommentCreate_lastReplyTime && (currentTime-loginUser.articleCommentCreate_lastReplyTime < 1000*60)){
        res.end("err_op_too_much");//操作太频繁，要等一分钟
        return;
    }
    loginUser.articleCommentCreate_lastReplyTime = currentTime;

    BlogPost.find({_id: articleId}, function (err, doc) {

        if (err || !doc || doc.length === 0) {
            res.end("err_no_article");//没有找到此文章，可能已经被删除了。
            return;
        }

        var post = doc[0];
        var replyCount = post.replyCount || 0;

        if(replyCount > 50){
            res.end("err_max_reply");//最多只能有50条评论，评论功能已关闭。
            return;
        }



        replyCount++;


        BlogPost.update({_id: articleId}, {"$set": {replyCount: replyCount}}, function (err, d) {

            if (err) {
                res.end("err_update");
                return;
            }

            var comment = {
                title: "",
                content: content,
                createDate: new Date(),
                createTime: cpUtil.dataFormat(),
                createUserNickName: loginUser.nickname,
                createUserAvatar: loginUser.avatar,
                createUserRole:loginUser.role,
                floorNumber: replyCount
            };

            BlogPost.addComment(articleId,comment, function (err, r) {
                if (err) {
                    res.end(err.toString());
                } else {

                    if(!comment.createUserAvatar){
                        comment.createUserAvatar = appConfig.DEFAULT_AVATAR;
                    }

                    res.render("blog/comments-item",{
                        status:"ok",
                        comment:comment,
                        layout:false
                    });
                }
            });
        });
    });
}

// GET      /article/comment/delete/:postId/:floorNumber  删除一个新回复
function articleCommentDelete(req, res, next) {
    var articleId = req.params.postId;
    var floorNumber = req.params.floorNumber;
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

router.get('/comment/delete/:postId/:floorNumber',articleCommentDelete);

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
 * GET      /article/comment/delete/:postId/:floorNumber  删除一个新回复
 *
 */