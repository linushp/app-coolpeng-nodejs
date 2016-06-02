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


    //滚动
    $(document).on('scroll', function(){

        var st = $(this).scrollTop(),
            nav_point = 90,
            $nav = $('#header');

        if( st >= nav_point ){
            $nav.addClass('headfixed');
        }
        else{
            $nav.removeClass('headfixed');
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
        $.get("/users/logout", function (d) {
            layer.alert("退出成功",function(){
                window.location.reload();
            });
        });
    });



    //评论页面点击用户登录按钮
    $(document).on("click", ".cp-sys-login", function () {

        //iframe窗
        layer.open({
            type: 1,
            title: "登录",
            area: ['340px', '215px'],
            btn: ['确定', "取消"],
            content: '' +
            '<div style="width: 240px;margin: 10px auto">' +
            '   <table>' +
            '       <tr style="height: 50px;">' +
            '           <td>昵称：</td>' +
            '           <td><input type="text" class="cp-input" name="nickname"></td>' +
            '       </tr>' +
            '       <tr style="height: 50px;">' +
            '           <td>邮箱：</td>' +
            '           <td><input type="text" class="cp-input" name="email"></td>' +
            '       </tr>' +
            '   </table>' +
            '</div>',
            yes: function(index, $content){ //此处用于演示
                var nickname = $content.find("input[name='nickname']").val();
                var email = $content.find("input[name='email']").val();
                if(!nickname || nickname.length===0){
                    layer.msg('昵称不能为空');
                    return;
                }
                if(!email || email.length===0){
                    layer.msg('请填写邮箱');
                    return;
                }
                $.post("/users/login",{
                    nickname:nickname,
                    email:email
                }, function (d) {
                    layer.alert("登录成功",function(){
                        window.location.reload();
                    });
                });
            }
        });


    });
















});