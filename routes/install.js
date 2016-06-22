var express = require('express');
var router = express.Router();
var BlogPost = require("./models/BlogModels").BlogPost;
var BlogTopic = require("./models/BlogModels").BlogTopic;
var cpPage = require("./../public/all-stack/cp-page");
var cpUtil = require("./utils/cp-util");
var toJsPostList = cpUtil.toJsPostList;
var getLayout = cpUtil.getLayout;




/**
 * 首页
 */
router.get('/install-all', function (req, res, next) {


    var topic1= new BlogTopic({topicId:"javascript",title:"JavaScript",postCount:0});
    var topic2= new BlogTopic({topicId:"web-front-end",title:"Web前端",postCount:0});
    var topic3= new BlogTopic({topicId:"swift",title:"Swift学习",postCount:0});
    var topic4= new BlogTopic({topicId:"objective-c",title:"Objective C",postCount:0});
    var topic5= new BlogTopic({topicId:"dragon-ball",title:"七龙珠的故事",postCount:0});
    var topic6= new BlogTopic({topicId:"happy-life",title:"生活日记",postCount:0});


    BlogTopic.remove(function(){
        topic1.save(function(){
            topic2.save(function(){
                topic3.save(function(){
                    topic4.save(function(){
                        topic5.save(function(){
                            topic6.save(function(){
                                res.end("ok");
                            });
                        });
                    });
                });
            });
        });
    });




});

module.exports = router;