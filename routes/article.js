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


function articleView() {

}
function articleCreateGet() {

}
function articleCreateSave() {

}
function articleModifyGet() {

}
function articleModifySave() {

}
function articleModifyDelete() {

}

function articleCommentGet() {

}

function articleCommentCreate() {

}

function articleCommentDelete() {

}

router.get('/view/:id',articleView);

router.get('/create',articleCreateGet);

router.post('/create',articleCreateSave);

router.get('/modify/:id',articleModifyGet);

router.post('/modify/:id',articleModifySave);

router.get('/delete/:id',articleModifyDelete);

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