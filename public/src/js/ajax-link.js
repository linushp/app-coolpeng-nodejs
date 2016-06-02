(function (window) {

    window.iniAjaxLink = function(config){

        var $ = jQuery;

        var firstTarget = config.firstTarget || "body";

        //给链接绑定事件
        if (window.history.pushState) {

            var ajaxHandler, firstState;

            var templateCache = {};

            $(document).on("click", ".ajax-link", function (e) {

                var $this = $(this);
                var ajaxTarget = $this.attr("ajax-target");

                //标记位，是否启用服务端渲染
                var ajaxRender = $this.attr("ajax-render") ||"";
                var isAjaxSSR = (ajaxRender ==="server");

                if (!ajaxTarget || ajaxTarget.length === 0) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                var $ajaxTarget = $(ajaxTarget);

                if (!ajaxHandler) {
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

                var ajaxHtmlSuccess = function(html,data){
                    if(loadingTimeout){
                        window.clearTimeout(loadingTimeout);
                    }
                    data = data||{};

                    $ajaxTarget.html(html);
                    var state = {
                        url: href,
                        title: data.title || $link.html(),
                        html: html,
                        ajaxTarget: ajaxTarget
                    };

                    window.history.pushState(state, null, href);
                };

                 ajaxHandler = $.ajax({
                    url:href,
                    dataType: (isAjaxSSR?"html":"json"),
                    type:"get",
                    timeout : 10000,
                    success: function (mm) {
                        if(isAjaxSSR){
                            ajaxHtmlSuccess(mm);
                        }
                        else {
                            var templateName = mm.templateName;
                            var template = mm.template;
                            if(template){
                                templateCache[templateName] = template;
                            }else {
                                template = templateCache[templateName];
                            }
                            var data = mm.data ||{};
                            var html = ejs.render(template, data);
                            ajaxHtmlSuccess(html,data);
                        }
                    },
                    complete : function(XMLHttpRequest,status){
                        if(status=='timeout'){
                            ajaxHandler.abort();
                        }
                    },
                    beforeSend: function(XMLHttpRequest) {
                        var templateName = config.getTemplateName(href,$link);
                        var template = null;
                        if(templateName){
                            template = templateCache[templateName];
                        }
                        if(template){
                            XMLHttpRequest.setRequestHeader("CP_NEED_TEMPLATE", "false");
                        }else{
                            XMLHttpRequest.setRequestHeader("CP_NEED_TEMPLATE", "true");
                        }
                        XMLHttpRequest.setRequestHeader("CP_TEMPLATE_RENDER", ajaxRender);
                    }
                });

            });


            window.addEventListener("popstate", function (event) {
                if (ajaxHandler == null) {
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