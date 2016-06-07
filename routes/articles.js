/**
 *
 *
 * GET   /articles/
 * GET   /articles/search/:keyword
 * GET   /articles/tag/:tagName  ---tag.title
 * GET   /articles/topic/:topicId  ---topicId
 *
 *
 *
 */
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
var appConfig = require('../app-config');


function doArticlesSearch(req, res, condition){
    var pageNumber = parseInt(req.query.pn || "1", 10);
    if (pageNumber < 1) {
        pageNumber = 1;
    }
    var pageSize = 20;

    blogService.getBlogList(condition,pageNumber,pageSize,function(data){
        res.renderWithSidebar('blog/index', _.extend({
            title: "文章列表"
        },data));
    });
}


function articlesIndex(req, res, next) {
    doArticlesSearch(req,res,{});
}

function articlesSearch(req, res, next) {
    var keyword = req.params.keyword;
    var condition = {
        "title":{"$regex": new RegExp(keyword), "$options":'i'}
    };
    doArticlesSearch(req,res,condition);
}
function articlesSearchTag(req, res, next) {
    var tagName = req.params.tagName;
    var condition = {
        "tagString":{"$regex": new RegExp(tagName), "$options":'i'}
    };
    doArticlesSearch(req,res,condition);
}
function articlesSearchTopicId(req, res, next) {
    var topicId = req.params.topicId;
    var condition = {
        "belongTopicId":topicId
    };
    doArticlesSearch(req,res,condition);
}

function articlesSearchByUserEmail(req, res, next) {
    var createUserEmail = req.params.createUserEmail;
    var condition = {
        "createUserEmail":createUserEmail
    };
    doArticlesSearch(req,res,condition);
}




router.get('/',articlesIndex); //都有可能后面有pn参数
router.get('/search/',articlesIndex);
router.get('/search/:keyword',articlesSearch);
router.get('/tag/:tagName',articlesSearchTag);
router.get('/topic/:topicId',articlesSearchTopicId);
router.get('/user/',articlesSearchByUserEmail);
router.get('/user/:createUserEmail',articlesSearchByUserEmail);

module.exports = router;