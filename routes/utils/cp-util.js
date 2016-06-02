var _ = require("underscore");
var fs=require("fs");
var path = require('path');
var appConfig = require('../../app-config');

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
                title: obj.title
            });
        }else {
            postList.push({
                id: id,
                title: obj.title,
                content: obj.content,
                createTime: obj.createTime,
                createUser: obj.createUser,
                comments: obj.comments
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
                    loginUser:{
                        nickname:"luanhaipeng"
                    },
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
                loginUser:{
                    isLogin:true,
                    nickname:"luanhaipeng"
                },
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


exports.toJsPostList = toJsPostList;
exports.smartParseAndRender = smartParseAndRender;