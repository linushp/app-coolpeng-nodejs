//tip
jQuery(document).ready(function ($) {
    $("#tooltip-weixin,#tooltip-qq,#tooltip-f-qq,#tooltip-f-weixin,#tooltip-mail-2").click(
        function () {
            var e = $(this);
            setTimeout(function () {
                    e.parents(".dropdown-menu-part").find(".dropdown-menu").toggleClass("visible");
                },
                200);
        });

    $('.m-search').on('click', function () {
        $('.search-box').slideToggle(200, function () {
            if ($('.m-search').css('display') == 'block') {
                $('.search-box .form-search').focus()
            }
        })
    });



});