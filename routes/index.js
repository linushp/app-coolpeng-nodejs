var express = require('express');
var Topic = require("./models/topic").Topic;
var Post = require("./models/post").Post;
var mongoose = require('mongoose');
//var db = global.mongooseDB;

var router = express.Router();

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


  Topic.count(function(err,count){

    Topic.find({_id:'57483a30c041b3f839d8c62a'},function(err,doc){
      res.render('index', { title: 'Express' + count,postList:doc });
    });

  });




});

module.exports = router;