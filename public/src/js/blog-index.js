jQuery(document).ready(function ($) {

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


    //给链接绑定事件
    if (window.history.pushState && $("#blog-index").length > 0) {

        var ajax, currentState;

        var $postContent = $(".post-content");

        $(document).on("click", ".post-item-link", function (e) {
            e.preventDefault();
            e.stopPropagation();

            $(".post-list").hide();
            $(".create-post").hide();

            if (ajax == undefined) {
                currentState = {
                    url: document.location.href,
                    title: document.title,
                    html: $postContent.html()
                };
            }


            var $link = $(this);
            var href = $link.attr("href");

            ajax = $.get(href, function (d) {
                $postContent.html(d);

                var state = {
                    url: href,
                    title: $link.html(),
                    html: d
                };

                window.history.pushState(state, null, href);
            }, "html")

        });


        window.addEventListener("popstate", function (event) {
            if (ajax == null) {
                return;
            } else if (event && event.state) {
                $(".post-list").hide();
                $(".create-post").hide();
                document.title = event.state.title;
                $postContent.html(event.state.html);
            } else {
                $(".post-list").show();
                $(".create-post").show();
                document.title = currentState.title;
                $postContent.html(currentState.html);
            }
        });

    }


});