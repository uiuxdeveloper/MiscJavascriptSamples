/**
 * Scene Transition controller
 * @author Curtis M. Janczak
 * @version 0.0.1
 * @namespace SCENE
 * @module {$} jQuery
 * @module {UTIL} mod.util.js
 * @description Pause video playback, Fade it out video, Zoom in as the blurred background comes into focus 
 *
 */

"use strict";

var SCENE = (function ( $, UTIL ){
    
    var $b = $("body");

    /**
     * Default options
     */
    var _options = {
        speed: 700,
        easing: "easeInQuad",
        close_button: ".btnCloseScene",
        close_button_lbl: "btnCloseScene",
        fade_scene_class: "fadeVid",
        video: "#video",
        video_blur_img: "#mainBg",
        wrapper: ".page"
    };

    /**
     * Initialize Revealing Object Module
     * @private
     * @param {Array|Object} _options
     * @function {function} bindOpenScene()
     */
    function _init( options ){
        _options = UTIL.extend( _options, options || {} );

        bindOpenScene();
        bindCloseScene();
    };
    
    /**
     * Fade out video
     * @private
     * @function {function} getWindowWidth()
     * @event {jQuery} animate and zoom in wrapper while easing the transition
     * @event {jQuery} show blurred background image
     * @event {jQuery} fade in blurred background image
     * @callback {jQuery} toggleVideoPlayback()
     */
    var fadeOutVideo = function () {
        
        if( $b.hasClass("home-page") ){
            var width   = $( _options.wrapper ).width() * 1.5,
                height  = width / 16 * 9,
                wWidth  = $(window).width(),
                wHeight  = $(window).height(),
                left    = width > wWidth ? ( width - wWidth ) / 2 * -1 : width / 2 / 2 * -1,
                top     = height > wHeight ? ( height - wHeight ) / 2 * -1 : 0;

            $( _options.wrapper ).animate( 
                {
                    width: width,
                    height: height,
                    left: left,
                    top: top
                }, _options.speed, _options.easing
            );

            $( _options.video_blur_img ).show();
            $( _options.video ).animate( { opacity: 0 }, _options.speed, _options.easing, function(){
                toggleVideoPlayback();
            });
        }
    };

    /**
     * Fade in video
     * @private
     * @event {jQuery} animate and zoom out wrapper while easing the transition
     * @event {jQuery} fade in video
     */
    var fadeInVideo = function () {

        if( $b.hasClass("home-page") ){
            var obj = $( _options.wrapper ),
                width = obj.attr("data-orig-width"), 
                height = obj.attr("data-orig-height"),
                top = obj.attr("data-orig-top"), 
                left = obj.attr("data-orig-left");

            $( _options.wrapper ).animate( 
                {
                    width: width,
                    height: height,
                    left: left,
                    top: top
                }, _options.speed, _options.easing
            );
            
            $( _options.video ).animate( { opacity: 1 }, _options.speed, _options.easing );
        }
    };

    /**
     * Toggle playback of video
     * @private
     */
    var toggleVideoPlayback = function(){
        var video = $( _options.video ).get(0);
        if (video) {
            video.paused ? video.play() : video.pause();
        }
    };
    
    /**
     * Bind event to open scene
     * @private
     * @event {jQuery} bind click event to trigger video fade
     * @callback {Function} fadeOutVideo()
     */
    var bindOpenScene = function(){
        $("." + _options.fade_scene_class ).on( "click", function( event ){
            event.preventDefault();

            // failsafe for vid event to close instead of open
            if( !$(this).hasClass(  _options.fade_scene_class ) ){
                $(this)
                    .removeClass( _options.close_button_lbl )
                    .addClass( _options.fade_scene_class );

                toggleVideoPlayback();
                fadeInVideo();

            // open and fadeout video
            } else {
                $(this)
                    .removeClass("fadeVid")
                    .addClass( _options.close_button_lbl );

                fadeOutVideo(); 
            }
        });
    };

    /**
     * Bind close button to close scene
     * @private
     * @event {jQuery} bind click event to trigger close modal content and fade video back in
     * @callback {Function} toggleVideoPlayback()
     * @callback {Function} fadeInVideo()
     */
    var bindCloseScene = function(){
        $( _options.close_button ).on("click", function(event){

            $(this)
                .removeClass( _options.close_button_lbl )
                .addClass( _options.fade_scene_class );

            toggleVideoPlayback();
            fadeInVideo();
        });
    };

    /**
     * @public
     * @return {Function} init()
     */
    return {
        init: _init
    };

}( SCENE || jQuery, UTIL ) );
