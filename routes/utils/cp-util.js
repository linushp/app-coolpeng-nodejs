var _ = require("underscore");
var fs=require("fs");
var path = require('path');

function getLayout(req){
   return isXHR(req) ? false : "layout";
}

function isXHR(req){
    var requestType = req.header("X-Requested-With");
    return (requestType==="XMLHttpRequest");
}


var toJsPostList = function (doc) {
    var postList = [];
    for (var i = 0; i < doc.length; i++) {
        var obj = doc[i];
        var id = (obj._id || {}).toString();
        postList.push({
            _id: id,
            id: id,
            title: obj.title,
            content: obj.content,
            createTime: obj.createTime,
            createUser: obj.createUser,
            comments: obj.comments
        });
    }

    return postList;
};


function isNeedTemplate(req){
    var CP_NEED_TEMPLATE = req.header("CP_NEED_TEMPLATE");
    return CP_NEED_TEMPLATE==="true";
}

var templateCache = {};



function smartRender(){
    return function smartRender(req, res, next){
        res.smartRender = function(templateName,data){
            if(isXHR(req)){

                if(isNeedTemplate(req)){

                    var template = templateCache[templateName];
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

                            console.log(err);
                            console.log(file);

                            //file = JSON.stringify(file.toString());
                            file = (file.toString());
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
                    layout: getLayout(req)
                },data);
                res.render(templateName,d);
            }
        };
        next();
    }
}


exports.getLayout = getLayout;
exports.toJsPostList = toJsPostList;
exports.smartRender = smartRender;