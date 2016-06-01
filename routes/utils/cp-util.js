function getLayout(req){
    var requestType = req.header("X-Requested-With");
    var layout = (requestType === "XMLHttpRequest" ? false : "layout");
    return layout;
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

exports.getLayout = getLayout;
exports.toJsPostList = toJsPostList;