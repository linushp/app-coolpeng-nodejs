var fs = require('fs');
var express = require('express');
var BlogTopic = require("./models/BlogModels").BlogTopic;
var cpUtil = require("./utils/cp-util");
var toJsPostList = cpUtil.toJsPostList;

var router = express.Router();

var postList = [];

/* GET home page. */
router.get('/', function(req, res, next) {

  //var db = mongoose.createConnection('mongodb://localhost:27017/helloworld');//；连接数据库
  //
  //
  //for (var i = 0; i < 1000; i++) {
  //  var topic = new Topic({id:"234",title:"24324"+new Date()});
  //  topic.save(function(e,r){
  //    console.log(e);
  //    //db.close();
  //  });
  //
  //}
  //var topic = new Topic({id:"234",title:"24324"+new Date()});
  //topic.save(function(e,r){
  //  console.log(e);
  //  //db.close();
  //});


  if(postList.length===0){

    BlogTopic.count(function(err,count){

      BlogTopic.find(function(err,doc){

        //var postList = [];
        for (var i = 0; i < doc.length && i <10; i++) {
          var dd = doc[i];
          postList.push({title:dd.title,id:dd.id})
        }

        res.smartRender('index', {title: 'Express' + count,postList:postList });
      });

    });
  }else {
    res.smartRender('index', {title: 'Express' ,postList:postList });
  }


});


/* GET home page. */
router.get('/favicon.ico', function(req, res, next) {
  res.end("");
});

module.exports = router;