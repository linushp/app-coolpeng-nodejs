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
var toJsPostList = cpUtil.toJsPostList;


function articlesIndex(req, res, next) {


    var pageNumber = parseInt(req.query.pn || "1", 10);
    if (pageNumber < 1) {
        pageNumber = 1;
    }
    var pageSize = 20;

    var condition = {};

    async.parallel([
            //function (callback) {
            //    blogService.getBlogSidebar(callback);
            //},
            function (callback) {
                BlogPost.count(condition, callback);
            },
            function (callback) {
                BlogPost.find(condition, callback).sort({ createDate : -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);
            }
        ],
        function (err, result) {
            //var sidebar = result[0]||{};
            var recordCount = result[0];
            //var postList = toJsPostList(result[1] || [], true);
            var postList = result[1] || []; //服务端渲染，不需要

            var pageCount = parseInt(recordCount / pageSize, 10);
            pageCount = (recordCount % pageSize === 0) ? pageCount : (pageCount + 1);

            var layPageHTML = cpPage.toPagination({
                pageNumber: pageNumber,
                pageCount: pageCount || 1,
                linkRender: function (num, text, isEnable) {
                    return '<a class="ajax-link" ajax-target=".main-body" href="/blog/?pn=' + num + '" >' + text + '</a>';
                }
            });

            res.renderWithSidebar('blog/index', {
                title: 'Express',
                //sidebar: sidebar,
                postList: postList,
                postListPage: layPageHTML
            });

        }
    );
}
function articlesSearch(req, res, next) {

}
function articlesSearchTag(req, res, next) {

}
function articlesSearchTopicId(req, res, next) {

}




router.get('/',articlesIndex);
router.get('/search/:keyword',articlesSearch);
router.get('/tag/:tagName',articlesSearchTag);
router.get('/topic/:topicId',articlesSearchTopicId);

module.exports = router;