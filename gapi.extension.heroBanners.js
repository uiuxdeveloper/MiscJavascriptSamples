////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BANNERS                                                                                                                        //
//  @extends gapi                                                                                                                 //
//                                                                                                                                //
//  Description: Hero Banners stored in Spotlight                                                                                 //
//  Params                                                                                                                        //
//      gameCode:                               - live game id that is referencing api                                            //
//      boardNo:                                - boardNo id defined by spotlight and referenced under gapi in Confluence         //
//      records:                                - number of hero banner records to pull from spotlight                            //
//                                                      ~ default = 1, but larger number could be used to pull in more records    //
//                                                                     and build a carousel.                                      //
//                                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Banners = gapi.$extend({

    __init__: function (options, action) {
        $.Banners = this;

        // Global Params
        $.Banners.param = {};
        $.Banners.param.gameCode = typeof options.gameCode === 'undefined' ? null : options.gameCode;
        $.Banners.param.size = typeof options.size === 'undefined' ? 'large' : options.size;
        $.Banners.param.boardNo = typeof options.boardNo === 'undefined' ? 140 : options.boardNo;
        $.Banners.param.records = typeof options.records === 'undefined' ? 1 : options.records;

        // Load default hero Banner
        $.Banners.model.findBanner();
    },

    // Model
    model: {
        findBanner: function () {
            var querystring = "http://gapi.nexon.net/api/" + $.Banners.param.gameCode + "/banner/hero/?boardNo=" + $.Banners.param.boardNo + "&records=" + $.Banners.param.records + "&callback=?";

            // API Call
            //alert(querystring);
            $.ajax({
                type: "GET",
                url: querystring,
                dataType: "jsonp",
                crossDomain: true,
                success: function (data) {
                    // load banners
                    if (typeof data !== 'undefined' && data !== null) {
                        data.banners = data;
                        $.Banners.view.loadBanners(data);
                    }
                }
            });
        }
    },

    // View
    view: {
        loadBanners: function (data) {
            if ($.Banners.param.size == 'large') {
                DotTemplates('banners.html', '#tmplBanners-Large', '#hero-banner', data, 'overwrite', '', function () {
                    $.Banners.controller.showBanners();
                    $.Banners.controller.bindLightBox();
                });
            } else {
                DotTemplates('banners.html', '#tmplBanners-Small', '#hero-banner', data, 'overwrite', '', function () {
                    $.Banners.controller.showBanners();
                    $.Banners.controller.bindLightBox();
                });
            }
        }
    },

    // Controller
    controller: {
        showBanners: function () {
            $('#hero-banner').show();                                         // show banners
            $.DotTemplates.view.resetContainer();                         // reset template container
        },
        bindLightBox: function () {
            // colorbox
            var win_w = $(window).width() * .75;
            var win_h = $(window).height() * .75;
            $(".vbox").colorbox({ iframe: true, innerWidth: win_w, innerHeight: win_h });
        }
    }
});