jQuery(document).ready(function ($) {

    //初始化ajaxLink
    iniAjaxLink({
        firstTarget: ".main-body",
        getTemplateName: function (href) {
            if (href.indexOf("/blog/post/") >= 0) {
                return "blog/post-content";
            }
            if (href.indexOf("/blog") >= 0) {
                return "blog/index";
            }
            return null;
        }
    });


    //滚动
    $(document).on('scroll', function () {

        var st = $(this).scrollTop(),
            nav_point = 90,
            $nav = $('#header');

        if (st >= nav_point) {
            $nav.addClass('headfixed');
        }
        else {
            $nav.removeClass('headfixed');
        }

    });


    function onClick(selector, callback) {
        $(document).on("click", selector, callback);
    }


    function getCreatePostContent(){

        var editor = UE.getEditor("create-ueditor");
        var content = editor.getContent();
        var contentSummary = editor.getContentTxt();
        if (contentSummary.length > 400) {
            contentSummary = contentSummary.slice(0, 400);
        }
        var $box = $("#create-post-box");
        var title = $box.find("input[name=title]").val();
        var belongTopicId = $box.find("select[name=belongTopicId]").val();
        var belongTopicTitle = $box.find("select[name=belongTopicId] option:selected").text();
        var tagString = $box.find("input[name=tagString]").val();

        return {
            title: title,
            content: content,
            contentSummary: contentSummary,
            tagString: tagString,
            belongTopicId: belongTopicId,
            belongTopicTitle: belongTopicTitle
        };
    }

    /**
     * 新建帖子按钮
     */
    onClick(".create-post-submit", function () {

        var data = getCreatePostContent();

        $.post("/article/create", data, function (res) {
            if (res === "ok") {
                layer.msg("&nbsp;&nbsp;&nbsp;新建成功&nbsp;&nbsp;&nbsp;", {
                    time: 0 ,//不自动关闭
                    btn: ['OK'],
                    yes: function () {
                        window.location.href = "/articles/";
                    }
                });
            }
        }, "text");

    });


    /**
     * 修改帖子按钮
     */
    onClick(".modify-post-submit", function () {

        var id = $(this).data("id");
        var data = getCreatePostContent();

        $.post("/article/modify/" + id, data, function (res) {
            if (res === "ok") {
                layer.msg("&nbsp;&nbsp;&nbsp;修改成功&nbsp;&nbsp;&nbsp;", {
                    time: 0,//不自动关闭
                    btn: ['OK'],
                    yes: function () {
                        window.location.href = "/articles/";
                    }
                });
            }
        }, "text");

    });




    //点击文章的回复按钮
    onClick(".create-post-comment-submit", function () {
        var m = $(".create-post-comment");
        var id = m.data("id");
        var comment = {
            title: m.find("[name=title]").val(),
            content: m.find("[name=content]").val()
        };
        $(".create-post-comment-msg").html("loading....");
        $.post("/article/comment/create/" + id, comment, function (d) {
            $(".create-post-comment-msg").html("");

            var errorText = getBlogErrI18N(d);
            if (errorText){
                layer.msg(errorText);
            }else {
                layer.msg("回复成功");
                $(".commentlist").append(d);
                m.find("[name=content]").val("")
            }

        },"html");
    });


    var doArticleSearch = function (e, $form) {
        e.preventDefault();
        e.stopPropagation();

        var keyword = $form.find("input[type=text]").val();
        keyword = encodeURIComponent(keyword);
        var href = "/articles/search/" + keyword;
        //ajaxTarget,href,ajaxRender,$eventSource
        ajaxGoTo(".main-body", href, "server", $form);

        return false;
    };

    $(document).on('submit', 'form.sidebar-search', function (e) {
        var $this = $(this);
        doArticleSearch(e, $this);
        return false;
    });


    //点击用户退出按钮
    onClick(".cp-sys-logout", function () {
        $.get("/users/logout", function (d) {
            layer.alert("退出成功", function () {
                window.location.reload();
            });
        });
    });


    //评论页面点击用户登录按钮
    onClick(".cp-sys-login", function () {

        $.get("/public/static/template/pop-login.html",function(template){

            layer.open({
                type: 1,
                title: "登录",
                area: ['400px', '400px'],
                btn: ['确定', "取消"],
                content: template,
                yes: function (index, $content) { //此处用于演示
                    var nickname = $content.find("input[name='nickname']").val();
                    var email = $content.find("input[name='email']").val();
                    if (!nickname || nickname.length === 0) {
                        layer.msg('昵称不能为空');
                        return;
                    }
                    if (!email || email.length === 0) {
                        layer.msg('请填写邮箱');
                        return;
                    }
                    $.post("/users/login", {
                        nickname: nickname,
                        email: email
                    }, function (d) {

                        var errText = getBlogErrI18N(d);
                        if(errText){
                            layer.msg(errText);
                        }else {
                            layer.alert("登录成功", function () {
                                window.location.reload();
                            });
                        }
                    });
                }
            });

        },"html");

    });



    //删除帖子按钮
    onClick(".cp-post-delete",function(){

        var $this = $(this);

        //询问框
        layer.confirm('确定要删除这篇文章吗？', {
            btn: ['确定','取消'] //按钮
        }, function(){

            var $postItem = $this.closest(".cp-post-item");
            var postId = $postItem.data("id");
            $.get("/article/delete/"+postId,function(d){
                var errText = getBlogErrI18N(d);
                if (errText){
                    layer.msg(errText);
                }else {
                    layer.msg("删除成功",function(){
                        window.location.reload();
                    });
                }
            },"text")

        }, function(){
        });


    });

    //编辑帖子按钮
    onClick(".cp-post-edit",function(){
        var $this = $(this);
        var $postItem = $this.closest(".cp-post-item");
        var postId = $postItem.data("id");
        window.location.href = "/article/modify/"+postId;
    });

});