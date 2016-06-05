var fs = require('fs');
var express = require('express');
var BlogTopic = require("./models/BlogModels").BlogTopic;
var cpUtil = require("./utils/cp-util");
var toJsPostList = cpUtil.toJsPostList;

var router = express.Router();

var postList = [];

/* GET home page. */
router.get('/', function(req, res, next) {


  res.redirect('/articles');



  //if(postList.length===0){
  //
  //  BlogTopic.count(function(err,count){
  //
  //    BlogTopic.find(function(err,doc){
  //
  //      //var postList = [];
  //      for (var i = 0; i < doc.length && i <10; i++) {
  //        var dd = doc[i];
  //        postList.push({title:dd.title,id:dd.id})
  //      }
  //
  //      res.smartRender('index', {title: 'Express' + count,postList:postList });
  //    });
  //
  //  });
  //}else {
  //  res.smartRender('index', {title: 'Express' ,postList:postList });
  //}


});


/* GET home page. */
router.get('/favicon.ico', function(req, res, next) {
  res.end("");
});

/* GET home page. */
router.get('/album', function(req, res, next) {
  res.smartRender("deving",{});
});

/* GET home page. */
router.get('/favorite', function(req, res, next) {
  res.smartRender("deving",{});
});

/* GET home page. */
router.get('/notes', function(req, res, next) {
  res.smartRender("deving",{});
});

module.exports = router;