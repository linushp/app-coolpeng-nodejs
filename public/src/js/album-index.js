jQuery(document).ready(function ($) {


    var albumPageSize = 16;
    var currentAlbumListPageNumber = 1;

    var albumDataStore = {
        imgs_g:[],
        imgs:[]
    };


    $(document).on('click','#albumContainer .albumPageLink',function(e){
        e.preventDefault();
        e.stopPropagation();
        var $link = $(this);
        var pn = $link.attr('pn');
        renderAlbumList(pn);
    });



    $(document).on('click','.goToAlbumImageList',function(e){
        e.preventDefault();
        e.stopPropagation();
        var $btn = $(this);
        $("#albumContainer").empty();
        var pid = $btn.closest('.albumItem').attr('pid');

        //TODO


    });


    function renderAlbumListPage(pageNumber){
        var recordCount = albumDataStore.imgs_g.length;
        var layPageHTML = toPagination({
            pageNumber: pageNumber,
            pageSize:albumPageSize,
            recordCount: recordCount || 1,
            linkRender: function (num, text, isEnable) {
                return '<a class="cp-page-link albumPageLink" pn="'+num+'" >' + text + '</a>';
            }
        });
        $("#albumContainer").append(layPageHTML);
    }

    function renderAlbumListBox(pageNumber){
        var albums = albumDataStore.imgs_g || [];
        var start = (pageNumber-1)*albumPageSize;
        var end = (pageNumber)*albumPageSize;
        var albumNowPage = albums.slice(start,end);

        var htmlArr = [];
        for(var i = 0 ;i< albumNowPage.length;i++){
            var m = albumNowPage[i];
            var t = '' +
                '<li class="item albumItem" pid="'+m.pid+'">' +
                '   <div class="img">' +
                '       <a href="/album" class="ztag goToAlbumImageList">' +
                '           <span class="bor"></span>' +
                '           <span class="bor bor1"></span>' +
                '           <span class="bor bor2"></span>' +
                '           <img src="http://image.coolpeng.cn/'+m.img+'@s_0,w_242,q_90" class="ztag">' +
                '       </a>' +
                '   </div>' +
                '   <div>' +
                '       <a href="/album" target="_blank" class="title goToAlbumImageList">'+m.ptitle+'</a>' +
                '   </div>' +
                '</li>';
            htmlArr.push(t);
        }

        var html = '' +
            '<ul class="albumList">' +
                htmlArr.join('') +
            '</ul>' +
            '<div class="clear"></div>';
        $("#albumContainer").append(html);
    }

    function renderAlbumList(pageNumber){
        currentAlbumListPageNumber = pageNumber;
        $("#albumContainer").empty();
        renderAlbumListBox(pageNumber);
        renderAlbumListPage(pageNumber);
    }


    function coolpengAlbumInit(){
        $.get('/public/static/data/imgs.json',function(d){
            albumDataStore = d;
            renderAlbumList(1);
        });
    }



    if(window.coolpengAlbumNextInit===true){
        coolpengAlbumInit();
        window.coolpengAlbumNextInit = false;
    }

    window.coolpengAlbumInit = coolpengAlbumInit;

});