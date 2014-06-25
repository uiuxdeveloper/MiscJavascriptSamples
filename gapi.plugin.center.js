jQuery.fn.center = function() {
    return this.each(function(){
        var el = $(this);
        var h = el.height();
        var w = el.width();
        var w_box = $(window).width();
        var h_box = $(window).height(); 
        var w_total = (w_box - w)/2;        //400

        if( typeof el.attr('data-cntr-top') !== 'undefined' )
            var h_total = el.attr('data-cntr-top');
        else
            var h_total = (h_box - h)/2;

        var css = {"position": 'absolute', "left": w_total+"px", "top": h_total+"px"};
        el.css(css)
    });
};

$(document).ready(function() {
    // center absolute positioned elements
    $( '.cntr' ).center();
});