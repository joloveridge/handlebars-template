// Hamburger menu JS

$(document).ready(function(){

    /* Menu fade/in out on mobile */
    $(".open-button").click(function(e){
        e.preventDefault();
        $(this).toggleClass('open');
        $(".menu").toggleClass('open');
    });

});

$(function () {
    $('.open-button').on('click', function (e) {
        var menuItem = $( e.currentTarget );

        if (menuItem.attr( 'aria-expanded') === 'true') {
            $(this).attr( 'aria-expanded', 'false');
        } else {
            $(this).attr( 'aria-expanded', 'true');
        }
    });
});

// Smooth scrolling

$(document).ready(function(){
    // Add smooth scrolling to all links
    $("a").on('click', function(event) {

        // Make sure this.hash has a value before overriding default behavior
        if (this.hash !== "") {
            // Prevent default anchor click behavior
            event.preventDefault();

            // Store hash
            var hash = this.hash;

            // Using jQuery's animate() method to add smooth page scroll
            // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function(){

                // Add hash (#) to URL when done scrolling (default click behavior)
                window.location.hash = hash;
            });
        } // End if
    });
});