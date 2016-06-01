var express = require('express');
var async = require("async");
var router = express.Router();
var BlogPost = require("./models/BlogModels").BlogPost;
var BlogTopic = require("./models/BlogModels").BlogTopic;
var cpPage = require("./utils/cp-page");
var cpUtil = require("./utils/cp-util");
var toJsPostList = cpUtil.toJsPostList;
var getLayout = cpUtil.getLayout;


/**
 * 首页
 */
router.get('/', function (req, res, next) {


    var pn = parseInt(req.query.pn || "1", 10);
    if (pn < 1) {
        pn = 1;
    }
    var pageNumber = pn;
    var pageSize = 20;

    var condition = {};

    async.parallel([
        function(callback){
            BlogPost.count(condition,callback);
        },
        function(callback){
            BlogPost.find(condition,callback).skip((pageNumber - 1) * pageSize).limit(pageSize);
        }
    ],
        function(err,result){

            var recordCount = result[0];
            var postList = toJsPostList(result[1] || []);

            var pageCount = parseInt(recordCount / pageSize, 10);
            pageCount = (recordCount % pageSize === 0) ? pageCount : (pageCount + 1);

            var layPageHTML = cpPage.toPagination({
                pageNumber: pageNumber,
                pageCount: pageCount || 1,
                linkRender: function (num, text, isEnable) {
                    return '<a class="ajax-link" ajax-target=".main-body" href="/blog/?pn=' + num + '" >' + text + '</a>';
                }
            });

            res.render('blog/index', {
                layout: getLayout(req),
                title: 'Express',
                postList: postList,
                postListPage: layPageHTML
            });

        }
    );



    //BlogPost.count(function (err, doc) {
    //
    //    var recordCount = doc;
    //    var pageNumber = pn;
    //    var pageSize = 20;
    //    var pageCount = parseInt(recordCount / pageSize, 10);
    //    pageCount = (recordCount % pageSize === 0) ? pageCount : (pageCount + 1);
    //
    //
    //    BlogPost.find(function (err, doc) {
    //
    //        var postList = toJsPostList(doc);
    //        var layPageHTML = cpPage.toPagination({
    //            pageNumber: pageNumber,
    //            pageCount: pageCount || 1,
    //            linkRender: function (num, text, isEnable) {
    //                return '<a class="ajax-link" ajax-target=".main-body" href="/blog/?pn=' + num + '" >' + text + '</a>';
    //            }
    //        });
    //
    //        res.render('blog/index', {
    //            layout: getLayout(req),
    //            title: 'Express',
    //            postList: postList,
    //            postListPage: layPageHTML
    //        });
    //
    //    }).skip((pageNumber - 1) * pageSize).limit(pageSize);
    //});



});


/**
 * 查看具体一篇文章
 */
router.get('/post/:id', function (req, res, next) {
    var id = req.params.id;


    BlogPost.find({_id: id}, function (err, doc) {
        if (doc && doc.length > 0) {
            var postList = toJsPostList(doc);
            var post = postList[0];
            res.render('blog/post', {layout: getLayout(req), title: 'Express', post: post});
        } else {
            res.render('blog/post', {layout: getLayout(req), title: 'Express', post: {title: "没有找到"}});
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

    var content = req.body.content;

    BlogPost.addComment(id, {title: "", content: content}, function (e, r) {
        if (e) {
            res.send("err" + "" + e.toString());
            res.end();
        } else {
            res.send("ok");
            res.end();
        }
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