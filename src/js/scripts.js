(function ($) {
  'use strict';

  console.log("TNC-Panel is a free admin template / dashboard based on Bootstrap 3.");

  // Multi-level collapse menu
  $('.app-aside .nav .has-child > a').on('click',function(e) {
    e.preventDefault();
    $(this).next('.nav-sub').slideToggle(300, function() {
      $(this).parent().toggleClass('active');
    });
  });

})(jQuery);
