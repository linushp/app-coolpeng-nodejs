var _ = require("underscore");
var fs=require("fs");
var path = require('path');
var appConfig = require('../../app-config');

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



var templateCache = {};

var createSmartRender = function(req, res, next){
    return function (templateName,data){

        if(isXHR(req)){

            if(isNeedTemplate(req)){

                //var template = templateCache[templateName];
                var template = null;
                if(template){
                    res.send({
                        templateName:templateName,
                        template:template,
                        data:data
                    });
                    res.end();
                }else {
                    var viewsPath = path.join(__dirname, '../../views');
                    var filePath = path.join(viewsPath,templateName);
                    if(!/.ejs$/.test(filePath)){
                        filePath += ".ejs";
                    }
                    fs.readFile(filePath,"utf-8",function(err,file){
                        if(err){
                            res.end("error");
                        }
                        file = (file.toString());

                        file = file.replace(/\s+|(\r\n)/g," ");

                        templateCache[templateName] = file;
                        res.send({
                            templateName:templateName,
                            template:file,
                            data:data
                        });
                        res.end();
                    });
                }

            }
            else {
                res.send({
                    templateName:templateName,
                    template:null,
                    data:data
                });
                res.end();
            }

        }else {
            var d =  _.extend({
                _ENVIRONMENT:appConfig._ENVIRONMENT,
                layout: getLayout(req)
            },data);
            res.render(templateName,d);
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