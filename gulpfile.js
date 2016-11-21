/*!
 * TNCPanel's Gulp File
 * https://github.com/mavisland/tncpanel
 * Copyright 2016 Tanju Yıldız
 * Licensed under MIT (https://github.com/mavisland/tncpanel/blob/master/LICENSE)
 */

'use strict';

// Required packages
var gulp        = require('gulp');
var gutil       = require('gulp-util');
var pkg         = require('./package.json');
var filesys     = require('fs');
var header      = require('gulp-header');
var rename      = require("gulp-rename");
var clean       = require("gulp-clean");
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var less        = require('gulp-less');
var cleanCSS    = require('gulp-clean-css');
var ejs         = require("gulp-ejs");
var browserSync = require('browser-sync').create();

// Set the banner content
var banner = ['/*!\n',
  ' * <%= pkg.title %> <%= pkg.version %>\n',
  ' * <%= pkg.description %>\n',
  ' *\n',
  ' * Copyright (c) ' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
  ' */\n',
  ''
].join('');

// Error Handling
var onError = function (err) {
  gutil.log(gutil.colors.red(err));
};

// Clean build directory
gulp.task("clean", function () {
  gutil.log(gutil.colors.yellow('Cleaning generated files.'));

  return gulp.src('dist/', {read: false})
    .pipe(clean());
});

// Compile LESS files from /less into /css
gulp.task('less', function() {
  return gulp.src('less/style.less')
    .pipe(less({
      paths: ["."] // Specify search paths for @import directives
    }))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function() {
  return gulp.src('dist/css/style.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Copy JS to dist
gulp.task('js', function() {
  return gulp.src(['js/tncpanel.js'])
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Minify JS
gulp.task('minify-js', ['js'], function() {
  return gulp.src('dist/js/tncpanel.js')
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Compile all EJS templates to HTML
var json = JSON.parse(filesys.readFileSync("tncpanel.json")); // parse json
gulp.task("templates", function() {
  var source = [
    'templates/*.ejs',
    '!' + 'templates/_*.ejs' // Don't build html which starts from underline
  ];

  gutil.log(gutil.colors.yellow('Compiling EJS templates to HTML files.'));

  return gulp.src(source)
    .pipe(ejs(json, {ext:'.html'}).on('error', gutil.log))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Copy vendor libraries from /bower_components into /vendor
gulp.task('copy', function() {
  gulp.src([
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'bower_components/font-awesome/css/font-awesome.min.css'
  ])
    .pipe(gulp.dest('dist/css'));

  gulp.src([
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/bootstrap/dist/js/bootstrap.min.js'
  ])
    .pipe(gulp.dest('dist/js'));

  gulp.src([
    'bower_components/bootstrap/fonts/*.{eot,svg,ttf,woff,woff2}',
    'bower_components/font-awesome/fonts/*.{eot,svg,ttf,woff,woff2}'
  ])
    .pipe(gulp.dest('dist/fonts'));
});

// Run everything
gulp.task('default', ['templates',]);

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'dist/'
    },
  });
});

// Dev task with browserSync
gulp.task('dev', ['clean', 'browserSync', 'copy', 'templates', 'less', 'minify-css', 'js', 'minify-js'], function() {
  gulp.watch('less/**/*.less', ['less']);
  gulp.watch('dist/css/style.css', ['minify-css']);
  gulp.watch('js/*.js', ['minify-js']);
  gulp.watch(['tncpanel.json', 'templates/*.ejs'], ['templates']);
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('dist/*.html', browserSync.reload);
  gulp.watch('dist/css/*.css', browserSync.reload);
  gulp.watch('dist/js/*.js', browserSync.reload);
});
