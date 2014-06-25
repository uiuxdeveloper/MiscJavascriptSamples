////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Star Rating System                                                                                                             //
//                                                                                                                                //
//  Description: Initialize a star rating system, utilizing jquery.raty.js                                                        //
//  Params                                                                                                                        //
//      callback:                           - Call a function when the ajax is finished processing                                //
//                                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Star Rating System Using jquery.raty.js
var StarRatings = gapi.$extend({
    // global parameters
    __classvars__ : {
        eventID: 1,     // configurable eventID
        path: '//nxcache.nexon.net/maplestory/microsite/a-better-maple/libraries/raty/img',
        score: function() {
            var score = $(this).attr('data-score');
            if( score > 0) {
                $(this).parent().find('.vote-cancel').show();
            }
            return score;
        },
        readOnly: function() {
            var score = $(this).attr('data-score');
            if( score > 0)
                return true;
        },
        click: function(id, score, obj) {
            if (!nexon.sso.isLoggedIn) {
                $.StarRatings.model.startRatingEngine();
                nexon.gnt.popupLoginAndRedirect();
                return false;
            }

            // store vote
            var score = typeof(score) !== 'number' ? '' : score,
                querystring = "/api/Improvements";

            $.ajax({
                url: querystring,
                type: 'POST',
                data: {
                    event_no: StarRatings.eventID,
                    submit_no: id, 
                    rating: score
                },
                success:function(data){
                    // disable stars
                    obj.raty('readOnly', true);
                    obj.parent().find('.vote-cancel').show();
                }
            });
        }
    },

    __init__: function(callback) {
        $.StarRatings               = this;

        // Params
        $.StarRatings.callback      = callback;

        // Process api Data
        $.StarRatings.model.getAPIData();
    },

    // Model
    model: {
        getAPIData: function() {
            $.ajax({
                url:"/api/Improvements/" + StarRatings.eventID,
                type: 'GET',
                success:function(data){
                    $.StarRatings.view.renderTmpl(data);            // render data into doT template  
                }
            });
        },
        startRatingEngine: function(){
            $('.vote').raty({
                path:       StarRatings.path,
                score:      StarRatings.score,
                readOnly:   StarRatings.readOnly,
                click:      function(score, evt){
                    var obj = $(this),
                        id = obj.attr('data-id');

                    StarRatings.click(id, score, $(this));
                }
            });
        }
    },

    // View
    view: {
        // Render doT Template
        renderTmpl: function(data) {
            DotTemplates('ratings.html', '#tmpl-ratings', '#ratings', data, 'overwrite', '', function () {
                $.StarRatings.model.startRatingEngine();    // start rating engine
                $.StarRatings.controller.cancelVoteBtn();   // cancel vote button
                $.StarRatings.controller.callback();        // Callback
            });
        }
    },

    // Controller
    controller: {
        // Cancel vote
        cancelVoteBtn: function(){
            $('.vote-cancel').on('click', function(e){
                e.preventDefault();

                var that = $(this);

                $.ajax({
                    url:"/api/Improvements",
                    type: 'DELETE',
                    data: {
                        event_no: StarRatings.eventID, 
                        submit_no: that.attr('data-id'), 
                    },
                    success:function(data){
                        that.parents('td').find('.vote').attr('data-score', '');
                        that.parents('td').find('.vote').raty('set', {
                            path:       StarRatings.path,
                            score:      StarRatings.score,
                            readOnly:   StarRatings.readOnly,
                            click:      function(score, evt){
                                var obj = $(this),
                                    id = obj.attr('data-id');

                                obj.attr('data-score', score);
                                StarRatings.click(id, score, obj);
                            }
                        });
                        that.hide();
                    }
                });
            });
        },

        // Callback
        callback: function() {
            if (typeof $.StarRatings.callback == 'function')
                $.StarRatings.callback();
        }
    }
});