var express = require('express');
var router = express.Router();
var BlogPost = require("./models/BlogModels").BlogPost;
var BlogTopic = require("./models/BlogModels").BlogTopic;


var toJsPostList = function (doc) {
    var postList = [];
    for (var i = 0; i < doc.length; i++) {
        var obj = doc[i];
        var id = (obj._id || {}).toString();
        postList.push({
            _id: id,
            id: id,
            title: obj.title,
            content: obj.content,
            createTime: obj.createTime,
            createUser: obj.createUser,
            comments: obj.comments
        });
    }

    return postList;
};

/**
 * 首页
 */
router.get('/', function (req, res, next) {


    BlogPost.find(function (err, doc) {
        var postList = toJsPostList(doc);
        res.render('blog/index', {layout: "layout", title: 'Express', postList: postList});
    });
});


/**
 * 查看具体一篇文章
 */
router.get('/post/:id', function (req, res, next) {
    var id = req.params.id;
    var requestType = req.header("X-Requested-With");
    var layout = (requestType === "XMLHttpRequest" ? false : "layout");

    BlogPost.find({_id: id}, function (err, doc) {
        if (doc && doc.length > 0) {
            var postList = toJsPostList(doc);
            var post = postList[0];
            res.render('blog/post', {layout: layout, title: 'Express', post: post});
        } else {
            res.render('blog/post', {layout: layout, title: 'Express', post: {title: "没有找到"}});
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

    BlogPost.addComment(id,{title:"",content:content},function(e,r){
        if (e){
            res.send("err"+""+ e.toString());
            res.end();
        }else {
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