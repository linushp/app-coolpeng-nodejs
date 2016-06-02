var express = require('express');
var async = require("async");
var router = express.Router();
var BlogPost = require("./models/BlogModels").BlogPost;
var BlogTopic = require("./models/BlogModels").BlogTopic;
var cpPage = require("./utils/cp-page");
var cpUtil = require("./utils/cp-util");
var toJsPostList = cpUtil.toJsPostList;


/**
 * 首页
 */
router.get('/', function (req, res, next) {


    var pageNumber = parseInt(req.query.pn || "1", 10);
    if (pageNumber < 1) {
        pageNumber = 1;
    }
    var pageSize = 20;

    var condition = {};

    async.parallel([
        function(callback){
            BlogTopic.find(callback);
        },
        function(callback){
            BlogPost.count(condition,callback);
        },
        function(callback){
            BlogPost.find(condition,callback).skip((pageNumber - 1) * pageSize).limit(pageSize);
        }
    ],
        function(err,result){
            var topicList = result[0];
            var recordCount = result[1];
            var postList = toJsPostList(result[2] || [],true);

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
                topicList:topicList,
                postList: postList,
                postListPage: layPageHTML
            });

        }
    );

});


/**
 * 查看具体一篇文章
 */
router.get('/post/:id', function (req, res, next) {
    var id = req.params.id;


    BlogPost.find({_id: id}, function (err, doc) {
        if (doc && doc.length > 0) {
            var postList = toJsPostList(doc,false);
            var post = postList[0];
            res.smartRender(['blog/post',"blog/post-content"], {title: 'Express', post: post});
        } else {
            res.smartRender(['blog/post',"blog/post-content"], {title: 'Express', post: {title: "没有找到"}});
        }
    });

});


/**
 * 新建一篇文件
 */
router.post('/post', function (req, res, next) {

    var post = new BlogPost(req.body);
    post.save(post, function (e, r) {
        res.send("ok");
        //res.end();
    });
    console.log();
});


/**
 * 给一篇文章添加评论
 */
router.post('/post-comment/:id', function (req, res, next) {
    var id = req.params.id;
    var loginUser = req.session.loginUser || {};
    var content = req.body.content;

    BlogPost.find({_id:id},function(err,doc){

        if(err || !doc || doc.length===0){
            res.end("没有找到此文章，可能已经被删除了。");
            return;
        }

        var post = doc[0];
        var replyCount  = post.replyCount || 0;
        replyCount++;


        BlogPost.update({_id:id},{"$set":{replyCount:replyCount}},function(err,d){

            if(err){
                res.end("更新帖子数据失败");
                return;
            }

            BlogPost.addComment(id, {
                title: "",
                content: content,
                date:new Date(),
                createTime:cpUtil.dataFormat(),
                createUserNickName:loginUser.nickname,
                createUserAvatar:loginUser.avatar,
                floorNumber:replyCount
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



});


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