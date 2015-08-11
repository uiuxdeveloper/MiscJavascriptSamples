/**
 * Matrix Layout of 2D element in 3D plane
 * @author Curtis M. Janczak
 * @version 0.0.1
 * @namespace MATRIX_LAYOUT
 * @requires {$} jQuery
 * @requires {UTIL} mod.util.js
 * @requires {CSSMatrix} CSSMatrix.js
 * @requires {RESOLUTION} mod.resolution.js
 * @description Render and control a layer so that it functions on a 3d matrix that is manipulated and follows the movement of the mouse.  This has been forked, customized and converted into a module pattern and based on samples provided at https://github.com/crocodoc/3d-demo/blob/master/demo2.html
 *
 */

"use strict";

var MATRIX_LAYOUT = (function ($, UTIL, CSSMatrix, RESOLUTION){

    var _matrix = window.WebKitCSSMatrix || window.MSCSSMatrix || CSSMatrix;
    
    /**
     * Settings
     */
    var _settings = {
        layers: {},
        transitioning: false,
        force_affine: /MSIE\s+9/i.test(navigator.userAgent),
        rotation: { x: 0, y: 0, z: 0 },    // current state of rotation, relative to original position (0,0,0)
        identity_matrix: new _matrix(),    // identity matrix, used to update rotationMatrix with a new rotation state
        rotation_matrix: new _matrix(),    // current rotation matrix to be applied to the layers
    };   

    /**
     * Default options
     */
    var _options = {
        ele: $('.page'),                // main wrapper
        num_layers: 1,                  // number of layers in 3D/Popout Layout
        layer_spacing: 20,              // z-index of 3D Layout
        exploded: true,                 // explode layers into 3D Layout
        resolutions: {
            small:  { init: false },
            med:    { init: false },
            large:  { init: true  },
            xlarge: { init: true  }
        }
    };


    /**
     * Initialize Revealing Object Module
     * @private
     * @param {Array|Object} _options
     * @param {Array|Object} AFFINE to redefine affine engine
     * @function {function} createLayers()
     * @function {function} updateLayers()
     * @function {function} enableTransitions()
     * @event {function} onWindowResize()
     * @event {function} resizeWindow()
     * @event {jQuery} update View with previously rendered html content
     * event {javascript} play video
     */
    function _init( options, AFFINE ){
        _options = UTIL.extend( _options, options || {} );

        var video = document.getElementById( "video" );

        if( RESOLUTION.isLarge() && _options.resolutions.large.init){
            var affine = AFFINE || _settings.force_affine ;

            createLayers();
            updateLayers();
            enableTransitions();

            // Load Layers
                onWindowResize();
                resizeWindow();
                $(".content-layer").each(function (i) {
                    $('.page-layer').eq(i).html( $(this).html() );
                    $(this).remove()
                });

                var video = document.getElementById( "video" );
                if (video) video.play();

            // END: Load Layers

            $(document.body).on('mousemove touchstart MSPointerDown', moveCanvas);
        }
    };

    /**
     * Change string to affine coordinates
     * @private
     * @return {string} affine coordinates
     */
    var toAffineString = function (m) {
        var fix6 = function (val) { return val.toFixed(6); };
        return  'matrix(' + [
            m.a, m.b,
            m.c, m.d,
            m.e, m.f
        ].map(fix6).join(', ') + ')';
    };

    /**
     * Change string to affine coordinates
     * @private
     * @event {jQuery} listen to window resize 
     * @description Resize and reinitialize when screen resolution is changed by the user
     */
    var onWindowResize = function(){
        var wt;

        $(window).resize( function(){
            clearTimeout( wt );

            var wt = setTimeout( function(){
                resizeWindow();
            }, 100);
        });  
    };

    /**
     * Resize dimensions when window resolution is changed
     * @private
     * @event {jQuery} update CSS of DOM element
     */
     var resizeWindow = function(){
        var top, left, width, height,
            obj = $('.page');

        obj.css({
                width: width = $(window).innerWidth() * 1.2,
                height: height = $(window).innerHeight() * 1.2,
                top: top = obj.offset().top,
                left: left = obj.offset().left
           })
           .attr( "data-orig-width", width )
           .attr( "data-orig-height", height )
           .attr( "data-orig-top", top )
           .attr( "data-orig-left", left );
           
    };

    /**
     * Enable transitions
     * @private
     * @event {jQuery} add class on element to indicate that a CSS3 page tranisition needs to start
     */
    var enableTransitions = function () {
        if( !_settings.transitioning )
            _options.ele.addClass('page-transitions');
    };

    /**
     * Disable transitions
     * @private
     * @event {jQuery} remove class on element to indicate that a CSS3 page tranisition ended
     */
    var disableTransitions = function () {
        if( _options.ele.hasClass('page-transitions') ){
            _settings.transitioning = true;

            var t = setTimeout( function(){
                _settings.transitioning = false;
                _options.ele.removeClass('page-transitions');
            }, 1000);
        }else
             _options.ele.removeClass('page-transitions');
    };

    /**
     * Rotate matrix
     * @private
     * @param {integer} x.coordinate
     * @param {integer} y.coordinate
     * @param {integer} z.coordinate
     * @event {function} updateLayers()
     */
    var rotate = function (dx, dy, dz) {
        _settings.rotation.x += dx || 0;
        _settings.rotation.y += dy || 0;
        _settings.rotation.z += dz || 0;

        _settings.rotation.x = _settings.rotation.x % 360;
        _settings.rotation.y = _settings.rotation.y % 360;
        _settings.rotation.z = _settings.rotation.z % 360;

        _settings.rotation_matrix = _settings.identity_matrix.rotate(_settings.rotation.x, _settings.rotation.y, _settings.rotation.z);

        updateLayers();
    };

    /**
     * Reset matrix
     * @private
     * @event {jQuery} resetTransform()
     */
    var resetRotate = function () {
        _settings.rotation.x -= _settings.rotation.x || 0;
        _settings.rotation.y -= _settings.rotation.y || 0;
        _settings.rotation.z -= _settings.rotation.z || 0;

        _settings.rotation.x = _settings.rotation.x % 360;
        _settings.rotation.y = _settings.rotation.y % 360;
        _settings.rotation.z = _settings.rotation.z % 360;

        _settings.rotation_matrix = _settings.identity_matrix.rotate(_settings.rotation.x, _settings.rotation.y, _settings.rotation.z);

        $.each( _settings.layers, function (i) {
            var $layer = $(this);

            resetTransform($layer);
        });
    };

    /**
     * Create Layer
     * @private
     * @event {jQuery} update DOM html()
     * @description grab html content and use it to build content on a new layer controlled with a CSS3 matrix
     */
    var createLayers = function () {
        var i, layers = '';

        for (i = 0; i < _options.num_layers; ++i)
            layers += '<div class="page-layer"></div>';
        
        _settings.layers = $(layers);

        _options.ele.html( _settings.layers );
    };

    /**
     * Update Layer
     * @private
     * @event {jQuery} transform Matrix layer(s) to shift with mousemovement
     */
    var updateLayers = function () {
        var flipped = (Math.abs( _settings.rotation.x ) > 90 && Math.abs( _settings.rotation.x ) < 270) ||
                      (Math.abs( _settings.rotation.y ) > 90 && Math.abs( _settings.rotation.y ) < 270);

        $.each( _settings.layers, function (i) {
            var $layer = $(this);

            if ( _settings.force_affine ) {
                if (flipped) $layer.css('z-index', _settings.layers.length - i);
                else $layer.css('z-index', i);
            }
            
            applyTransform($layer);
        });
    };

    /**
     * Apply Transform Layer
     * @private
     * @event {jQuery} update CSS of DOM element with matrix coordinates
     */
    var applyTransform = function ($layer) {
        var z = _options.exploded ? $layer.index() * _options.layer_spacing : 0;
        var matrix = _settings.rotation_matrix.translate(0, 0, z);

        $layer.css('transform', _settings.force_affine ? toAffineString(matrix) : matrix.toString());
    };

    /**
     * Reset transform
     * @private
     * @event {jQuery} update CSS of DOM element with matrix coordinates
     */
    var resetTransform = function ($layer) {
        var z = 0;
        var matrix = _settings.rotation_matrix.translate(0, 0, z);

        $layer.css('transform', _settings.force_affine ? toAffineString(matrix) : matrix.toString());
    };

    /**
     * Get mouse coordinates
     * @private
     * @param {object} event of mouse event and its data
     */
    var getCoord = function (ev) {
        ev = ev.originalEvent || ev;

        var offset = _options.ele ? _options.ele.offset() : { left: 0, top: 0 };

        var x = ev.touches && ev.touches[0].pageX ||
                ev.pageX ||
                ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        var y = ev.touches && ev.touches[0].pageY ||
                ev.pageY ||
                ev.clientY + document.body.scrollTop + document.documentElement.scrollTop;

        return {
            x: x - offset.left,
            y: y - offset.top
        };
    }
    
    /**
     * Move Canvas
     * @private
     * @param {object} Event of mouse event and its data
     * @event {jQuery} On mouse move
     * @event {jQuery} On mouse leave window
     * @function disableTransitions()
     * @return false
     */
    var moveCanvas = function (ev) {
        ev.preventDefault();

        var last = getCoord(ev);

        // on mouse move
        var mousemove = function (ev) {
            ev.preventDefault();

            var mouse = getCoord(ev);   // get mouse coordinates

            // set rotation axis
            // Note: x and y mean different things in mouse coords, vs rotation axes
            var dx = (mouse.x - last.x) / 80,
                dy = (mouse.y - last.y) / 80;
            last = mouse;

            rotate( -dy, dx );

            return false;
        };

        // on mouse leave window
        var mouseleave = function (ev) {
            ev.preventDefault();

            $(document.body)
                .off('mousemove touchmove MSPointerMove', mousemove)
                .off('mouseleave', mouseleave);

            resetRotate();
            enableTransitions();

            return false;
        };

        // disable Transistions
        disableTransitions();

        if( !_settings.transitioning ){
            $(document.body)
                .one('mousemove touchmove MSPointerMove', function( event ){
                    mousemove( event );

                })
                .one('mouseleave', mouseleave);
        }

        return false;
    };

    /**
     * @public
     * @return {Function} _init()
     */
    return {
        init: _init
    };

}( MATRIX_LAYOUT || jQuery, UTIL, CSSMatrix, RESOLUTION ) );
