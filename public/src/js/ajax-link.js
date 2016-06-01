(function (window) {

    window.iniAjaxLink = function(config){

        var $ = jQuery;

        var firstTarget = config.firstTarget || "body";

        //给链接绑定事件
        if (window.history.pushState) {

            var ajax, firstState;

            $(document).on("click", ".ajax-link", function (e) {

                var $this = $(this);
                var ajaxTarget = $this.attr("ajax-target");
                if (!ajaxTarget || ajaxTarget.length === 0) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                var $ajaxTarget = $(ajaxTarget);

                if (!ajax) {
                    firstState = {
                        url: document.location.href,
                        title: document.title,
                        html: $(firstTarget).html(),
                        ajaxTarget:firstTarget
                    };
                }


                var $link = $(this);
                var href = $link.attr("href");

                var loadingTimeout = window.setTimeout(function(){
                    $ajaxTarget.html("loading...");
                },500);

                ajax = $.get(href, function (html) {
                    window.clearTimeout(loadingTimeout);
                    $ajaxTarget.html(html);

                    var state = {
                        url: href,
                        title: $link.html(),
                        html: html,
                        ajaxTarget: ajaxTarget
                    };

                    window.history.pushState(state, null, href);

                }, "html");

            });


            window.addEventListener("popstate", function (event) {
                if (ajax == null) {
                } else if (event && event.state) {
                    document.title = event.state.title;
                    var $ajaxTarget = $(event.state.ajaxTarget);
                    $ajaxTarget.html(event.state.html);
                } else {
                    document.title = firstState.title;
                    var $firstTarget =$(firstTarget);
                    $firstTarget.html(firstState.html);
                }
            });
        }



    };


})(window);