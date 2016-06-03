var _ = require("underscore");
var fs=require("fs");
var path = require('path');
var appConfig = require('../../app-config');


function dataFormat(date,fmt){

    if(!date){
        date = new Date();
    }
    if (!fmt){
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

function getLayout(req){
   return isXHR(req) ? false : "layout";
}

function isXHR(req){
    var requestType = req.header("X-Requested-With");
    return (requestType==="XMLHttpRequest");
}


var toJsPostList = function (doc,isSummary) {
    var postList = [];
    for (var i = 0; i < doc.length; i++) {
        var obj = doc[i];
        var id = (obj._id || {}).toString();
        if(isSummary){
            postList.push({
                id: id,
                title: obj.title,
                contentSummary:obj.contentSummary,
                tags:obj.tags
            });
        }else {
            postList.push({
                id: id,
                title: obj.title,
                content: obj.content,
                createTime: obj.createTime,
                createUser: obj.createUser,
                comments: obj.comments,
                tags:obj.tags
            });
        }

    }

    return postList;
};



function isNeedTemplate(req){
    var CP_NEED_TEMPLATE = req.header("CP_NEED_TEMPLATE");
    return CP_NEED_TEMPLATE==="true";
}


function isAjaxServerRender(req){
    var CP_TEMPLATE_RENDER = req.header("CP_TEMPLATE_RENDER");
    return CP_TEMPLATE_RENDER==="server";
}

function parseTemplateName(names){
    if(isArray(names)){
        return {
            renderTemplate:names[0],
            ajaxTemplate:names[1]
        };
    }else {
        return {
            renderTemplate:names,
            ajaxTemplate:names
        };

    }
}

function getLoginUserFromSession (req, res) {
    var loginUser = req.session.loginUser;
    return _.extend({
        nickname:"luanhaipeng",
        isLogin:false,
        avatar:"",
        role:"guest"//admin,user
    },loginUser);
}

var templateCache = {};

var createSmartRender = function(req, res, next){
    return function (templateName,data){

        var names = parseTemplateName(templateName);
        var renderTemplate = names.renderTemplate;
        var ajaxTemplate = names.ajaxTemplate;

        if(isXHR(req) && !isAjaxServerRender(req)){

            if(isNeedTemplate(req)){

                var template = templateCache[templateName];

                if(template){
                    res.send({
                        templateName:ajaxTemplate,
                        template:template,
                        data:data
                    });
                    res.end();
                }else {
                    var viewsPath = path.join(__dirname, '../../views');
                    var filePath = path.join(viewsPath,ajaxTemplate);
                    if(!/.ejs$/.test(filePath)){
                        filePath += ".ejs";
                    }
                    fs.readFile(filePath,"utf-8",function(err,file){
                        if(err){
                            res.end("error");
                        }
                        file = (file.toString());

                        file = file.replace(/\s+|(\r\n)/g," ");

                        //开发环境没有缓存
                        if(appConfig._ENVIRONMENT!=="development"){
                            templateCache[ajaxTemplate] = file;
                        }

                        res.send({
                            templateName:ajaxTemplate,
                            template:file,
                            data:data
                        });
                        res.end();
                    });
                }

            }
            else {
                res.send({
                    templateName:ajaxTemplate,
                    template:null,
                    data:data
                });
                res.end();
            }

        }else {

            //如果不是ajax请求，获取前台要求服务端渲染的话
            //服务端渲染

            var d =  _.extend({
                loginUser:getLoginUserFromSession(req,res),
                title:"coolpeng",
                _ENVIRONMENT:appConfig._ENVIRONMENT,
                layout: getLayout(req)
            },data);
            res.render(renderTemplate,d);
        }
    }
};





function smartParseAndRender(){
    return function smartParseAndRender(req, res, next){
        res.smartRender = createSmartRender(req, res, next);

        next();
    }
}




function isPermissionCreatePost(req){
    var loginUser = req.session.loginUser;
    if(!loginUser || !loginUser.isLogin || (loginUser.role!=="admin")){
        return false;
    }
    return true;
}


exports.toJsPostList = toJsPostList;
exports.smartParseAndRender = smartParseAndRender;
exports.dataFormat = dataFormat;
exports.isPermissionCreatePost = isPermissionCreatePost;