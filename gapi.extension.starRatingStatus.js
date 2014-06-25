////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Star Rating Status                                                                                                             //
//                                                                                                                                //
//  Description: update dev status of things rated by the star system                                                             //
//  Params                                                                                                                        //
//      callback:                           - Call a function when the ajax is finished processing                                //
//                                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var StarRatingsStatus = gapi.$extend({
    // global parameters
    __classvars__ : {},

    __init__: function(callback) {
        $.StarRatingsStatus         = this;

        // Params
        $.StarRatingsStatus.callback      = callback;

        // Process api Data
        $.StarRatingsStatus.model.getAPIData();
    },

    // Model
    model: {
        getAPIData: function() {
            $.getJSON( "js/data/data.txt", function( data ) {
                $.StarRatingsStatus.view.renderTmpl(data);    // render data into doT template
            });
        }
    },

    // View
    view: {
        // Render doT Template
        renderTmpl: function(data) {
            DotTemplates('ratingsStatus.html', '#tmpl-ratingsStatus', '#ratingsStatus', data, 'overwrite', '', function () {
                $.StarRatingsStatus.controller.callback();        // Callback
            });
        }
    },

    // Controller
    controller: {
        // Callback
        callback: function() {
            if (typeof $.StarRatingsStatus.callback == 'function')
                $.StarRatingsStatus.callback();
        }
    }
});