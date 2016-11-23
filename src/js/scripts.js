(function ($) {
  'use strict';

  console.log("TNC-Panel is a free admin template / dashboard based on Bootstrap 3.");

  // Multi-level collapse menu
  $('.app-aside ul.nav > li:has(ul)').addClass('has-child');

  $('.app-aside ul.nav:not(.nav-sub) > li.has-child > a').click(function(e) {
    // Disable href action
    e.preventDefault();

    $('.app-aside ul.nav > li.has-child > ul.nav-sub').slideUp().parent('li').removeClass('active');

    if ($(this).next('.nav-sub').is(':hidden')) {
      $(this).next('.nav-sub').slideDown(300).parent('li').addClass('active');
    } else {
      $(this).next('.nav-sub').slideUp(300).parent('li').removeClass('active');
    }
  });

  $('.app-aside ul.nav-sub > li.has-child > a').click(function(e) {
    // Disable href action
    e.preventDefault();

    $('.app-aside ul.nav-sub > li.has-child > ul.nav-sub').slideUp().parent('li').removeClass('active');

    if ($(this).next('.nav-sub').is(':hidden')) {
      $(this).next('.nav-sub').slideDown(300).parent('li').addClass('active');
    } else {
      $(this).next('.nav-sub').slideUp(300).parent('li').removeClass('active');
    }
  });

  // Sidebar toggle button
  $('button.aside-toggle').on('click', function() {
    $(this).toggleClass('active');
    $('.app').toggleClass('aside-collapse');
  });

})(jQuery);
