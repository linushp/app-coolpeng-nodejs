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

function articlesIndex(req, res, next) {

    var pageNumber = parseInt(req.query.pn || "1", 10);
    if (pageNumber < 1) {
        pageNumber = 1;
    }
    var pageSize = 20;
    var condition = {};

    blogService.getBlogList(condition,pageNumber,pageSize,function(data){
        res.renderWithSidebar('blog/index', _.extend({
            title: "文章列表"
        },data));
    });
}

function articlesSearch(req, res, next) {
    var keyword = req.params.keyword;

    var pageNumber = parseInt(req.query.pn || "1", 10);
    if (pageNumber < 1) {
        pageNumber = 1;
    }
    var pageSize = 20;
    var condition = {
        "title":{"$regex": new RegExp(keyword), "$options":'i'}
    };

    blogService.getBlogList(condition,pageNumber,pageSize,function(data){
        res.renderWithSidebar('blog/index', _.extend({
            title: "查找"
        },data));
    });
}
function articlesSearchTag(req, res, next) {

}
function articlesSearchTopicId(req, res, next) {

}




router.get('/',articlesIndex); //都有可能后面有pn参数
router.get('/search/',articlesIndex);
router.get('/search/:keyword',articlesSearch);
router.get('/tag/:tagName',articlesSearchTag);
router.get('/topic/:topicId',articlesSearchTopicId);

module.exports = router;