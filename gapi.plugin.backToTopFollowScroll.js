jQuery.fn.backToTopFollowScroll = function() {
    return this.each(function(){
        var el = $(this),
            tophide = 0,
            offset = 50,
            maxOffset = 50,
            timer,
            button = $('#backtotop'),
            buttonHeight = button.height();

        if ($(document).scrollTop() <= tophide) {
            button.css({ opacity: 0 });
        }
        button.show();
        animate();
        $(window).bind('scroll resize', function () {
            clearTimeout(timer);
            timer = setTimeout(animate, 20);
        });
        function animate() {
            var aniTop = $(document).scrollTop() + $(window).height() - buttonHeight - offset,
                alpha = $(document).scrollTop() > tophide ? 1 : 0;
            aniTop = Math.min(parseInt($(document).height()) - maxOffset, aniTop);
            button.stop().animate({ top: aniTop, opacity: alpha }, 500, 'easeOutQuad');
        }
    });
};

$(document).ready(function() {
    // center absolute positioned elements
    $( '#backtotop' ).backToTopFollowScroll();
});