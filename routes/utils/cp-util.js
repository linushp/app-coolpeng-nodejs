var _ = require("underscore");
var fs = require("fs");
var path = require('path');
var async = require("async");
var ejs = require('ejs');
var appConfig = require('../../app-config');
var blogService = require("./blog-service");


function dataFormat(date, fmt) {

    if (!date) {
        date = new Date();
    }
    if (!fmt) {
        fmt = "yyyy-MM-dd hh:mm:ss";
    }

    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
}

function getLayout(req) {
    if(isXHR(req)) {
        return false;
    }else if (appConfig._ENVIRONMENT==="development"){
        return "layout";
    }else {
        return "release/layout";
    }
}

function isXHR(req) {
    var requestType = req.header("X-Requested-With");
    return (requestType === "XMLHttpRequest");
}


var toJsPostList = function (doc, isSummary) {
    var postList = [];
    for (var i = 0; i < doc.length; i++) {
        var obj = doc[i];
        var id = (obj._id || "").toString();
        obj.id = id;
        if (isSummary) {
            postList.push({
                id: id,
                title: obj.title,
                contentSummary: obj.contentSummary,
                tags: obj.tags
            });
        } else {
            postList.push(obj);
        }

    }

    return postList;
};


function isNeedTemplate(req) {
    var CP_NEED_TEMPLATE = req.header("CP_NEED_TEMPLATE");
    return CP_NEED_TEMPLATE === "true";
}


function isAjaxServerRender(req) {
    var CP_TEMPLATE_RENDER = req.header("CP_TEMPLATE_RENDER");
    return CP_TEMPLATE_RENDER === "server";
}

function parseTemplateName(names) {
    if (isArray(names)) {
        return {
            renderTemplate: names[0],
            ajaxTemplate: names[1]
        };
    } else {
        return {
            renderTemplate: names,
            ajaxTemplate: names
        };

    }
}

function getLoginUserFromSession(req, res) {
    var loginUser = req.session.loginUser;
    return _.extend({
        nickname: "luanhaipeng",
        isLogin: false,
        avatar: "",
        role: "guest"//admin,user
    }, loginUser);
}

var templateCache = {};


var createSmartRender = function (req, res, next) {
    return function (templateName, data) {
        //1、不是ajax请求
        //2、前台要求服务端渲染的话
        var d = _.extend({
            loginUser: getLoginUserFromSession(req, res),
            title: "coolpeng",
            PAGE_FOOTER:"",
            _ENVIRONMENT: appConfig._ENVIRONMENT,
            layout: getLayout(req)
        }, data);
        res.render(templateName, d);
    }
};


function renderOutWithSidebar(req, res, templateName, sidebarHTML, data) {
    var d = _.extend({
        loginUser: getLoginUserFromSession(req, res),
        title: "coolpeng",
        PAGE_FOOTER:"",
        _ENVIRONMENT: appConfig._ENVIRONMENT,
        HTML_SIDEBAR: sidebarHTML,
        layout: getLayout(req) //如果是Ajax请求的话，没有layout
    }, data);
    res.render(templateName, d);
}


var sidebarCachedTime = null;
var createRenderWithSidebar = function (req, res, next) {
    return function (templateName, data) {

        //一小时更新一下缓存
        if (!sidebarCachedTime || (new Date().getTime() - sidebarCachedTime > (1000 * 60 * 60))) {


            async.parallel([
                    function (callback) {
                        var filePath = path.join(appConfig.ROOT_DIR, "/views/blog/sidebar.ejs");
                        fs.readFile(filePath, "utf-8", callback);
                    },
                    function (callback) {
                        blogService.getBlogSidebar(callback);
                    }
                ],
                function (err, result) {
                    var tpl = result[0] || "";

                    var sidebarHTML = ejs.render(tpl, {
                        sidebar: result[1]
                    });
                    renderOutWithSidebar(req, res, templateName, sidebarHTML, data);

                    var cacheFile = path.join(appConfig.ROOT_DIR, "/cached/sidebar.html");
                    fs.writeFile(cacheFile, sidebarHTML, function () {
                        sidebarCachedTime = new Date().getTime();
                    });
                }
            );
        }
        else {
            var cacheFile = path.join(appConfig.ROOT_DIR, "/cached/sidebar.html");
            fs.readFile(cacheFile, "utf-8", function (err, file) {
                var sidebarHTML = file.toString();
                renderOutWithSidebar(req, res, templateName, sidebarHTML, data);
            });
        }
    }
};








var sidebarMemCachedTemplate = null;
var sidebarMemCachedTime = null;
var createRenderWithSidebarMemCache = function (req, res, next) {
    return function (templateName, data) {


        //一小时更新一下缓存
        if (!sidebarMemCachedTime || (new Date().getTime() - sidebarMemCachedTime > (1000 * 60 * 60)) || appConfig._ENVIRONMENT==="development") {

            async.parallel([
                    function (callback) {
                        //读取模板
                        var filePath = path.join(appConfig.ROOT_DIR, "/views/blog/sidebar.ejs");
                        fs.readFile(filePath, "utf-8", callback);
                    },
                    function (callback) {
                        //读取数据库
                        blogService.getBlogSidebar(callback);
                    }
                ],
                function (err, result) {
                    var tpl = result[0] || "";
                    sidebarMemCachedTemplate = ejs.render(tpl, {
                        sidebar: result[1]
                    });
                    renderOutWithSidebar(req, res, templateName, sidebarMemCachedTemplate, data);
                    sidebarMemCachedTime = new Date().getTime();
                }
            );
        }
        else {
            renderOutWithSidebar(req, res, templateName, sidebarMemCachedTemplate, data);
        }
    }
};


function smartParseAndRender() {
    return function smartParseAndRender(req, res, next) {
        res.smartRender = createSmartRender(req, res, next);
        //res.renderWithSidebar = createRenderWithSidebar(req, res, next);
        res.renderWithSidebar = createRenderWithSidebarMemCache(req, res, next);
        next();
    }
}


function isPermissionCreatePost(req) {
    var loginUser = req.session.loginUser;
    if (!loginUser || !loginUser.isLogin || (loginUser.role !== "admin")) {
        return false;
    }
    return true;
}


exports.toJsPostList = toJsPostList;
exports.smartParseAndRender = smartParseAndRender;
exports.dataFormat = dataFormat;
exports.isPermissionCreatePost = isPermissionCreatePost;