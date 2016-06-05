(function(window){

    var blogErrI18N = {
        err_no_article:"没有找到此文章，可能已经被删除了。",
        err_max_reply:"最多只能有50条评论，评论功能已关闭。",
        err_update:"更新失败",
        err_no_reply:"没有填写评论内容",
        err_no_login:"用户没有登录",
        err_reply_too_long:"您输入的评论太长了，最多只能评论300字！",
        err_op_too_much:"您操作太频繁了，休息一分钟吧。"
    };


    window.getBlogErrI18N = function(text){
        if(!text || text.length===0){
            return null;
        }
        var reg = /^err/ ;
        if(text.length < 50 && reg.test(text)){
            return blogErrI18N[text];
        }
        return null;
    };

})(window);