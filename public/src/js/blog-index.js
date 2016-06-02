jQuery(document).ready(function ($) {

    //初始化ajaxLink
    iniAjaxLink({
        firstTarget:".main-body",
        getTemplateName:function(href){
            if(href.indexOf("/blog/post/")>=0){
                return "blog/post-content";
            }
            if(href.indexOf("/blog")>=0){
                return "blog/index";
            }
            return null;
        }
    });




    //点击新建文章按钮
    $(document).on("click", ".create-post-submit", function () {
        var m = $(".create-post");
        var post = {
            title: m.find("input[name=title]").val(),
            content: m.find("[name=content]").val()
        };
        $(".create-post-msg").html("loading....");
        $.post("/blog/post", post, function (d) {
            $(".create-post-msg").html(d);
        });
    });


    //点击文章的回复按钮
    $(document).on("click", ".create-post-comment-submit", function () {
        var m = $(".create-post-comment");
        var id = m.data("id");
        var comment = {
            title: m.find("[name=title]").val(),
            content: m.find("[name=content]").val()
        };
        $(".create-post-comment-msg").html("loading....");
        $.post("/blog/post-comment/" + id, comment, function (d) {
            $(".create-post-comment-msg").html(d);
        });
    });




    //点击用户退出按钮
    $(document).on("click", ".cp-sys-logout", function () {
        $.get("/user/logout", function (d) {
            layer.alert("退出成功",function(){
                window.location.reload();
            });
        });
    });



    //评论页面点击用户登录按钮
    $(document).on("click", ".cp-comment-login", function () {
        $.get("/user/logout", function (d) {
            layer.alert("登录成功",function(){
                window.location.reload();
            });
        });
    });









});