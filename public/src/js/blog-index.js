jQuery(document).ready(function ($) {

    //初始化ajaxLink
    iniAjaxLink({
        firstTarget:".main-body",
        getTemplateName:function(href){
            if(href.indexOf("/blog/post/")>=0){
                return "blog/post";
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

});