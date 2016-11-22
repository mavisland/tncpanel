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

// Error Handling
var onError = function (err) {
  gutil.log(gutil.colors.red(err));
};

// Set the banner content
var banner = ['/*!\n',
  ' * TNC-Panel v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
  ' * <%= pkg.description %>\n',
  ' *\n',
  ' * Copyright (c) ' + (new Date()).getFullYear(), ' <%= pkg.author.name %> <<%= pkg.author.email %>> \n',
  ' * Licensed under the <%= pkg.license.type %> license (<%= pkg.license.url %>)\n' +
  ' */\n',
  ''
].join('');

// Path Variables
var paths = {
  assets           : 'src/assets/',
  build            : 'dist/',
  data             : 'src/data/',
  scripts          : 'src/js/',
  styles           : 'src/less/',
  templates        : "src/templates/",
  bower_components : 'bower_components/',
  node_modules     : 'node_modules/'
};

// Input files variables
var inputFiles = {
  buildFiles         : paths.build + "**",
  lessEntryPointFile : paths.styles + "style.less",
  lessFiles          : paths.styles + "**/*.less",
  htmlConfigJSON     : paths.data + "data.json",
  htmlInputFiles     : [
    paths.templates + '*.ejs',
    '!' + paths.templates + '_*.ejs'
  ],
  jsInputFiles       : [
    paths.scripts + 'bootstrap/transition.js',
    paths.scripts + 'bootstrap/alert.js',
    paths.scripts + 'bootstrap/button.js',
    paths.scripts + 'bootstrap/carousel.js',
    paths.scripts + 'bootstrap/collapse.js',
    paths.scripts + 'bootstrap/dropdown.js',
    paths.scripts + 'bootstrap/modal.js',
    paths.scripts + 'bootstrap/tooltip.js',
    paths.scripts + 'bootstrap/popover.js',
    paths.scripts + 'bootstrap/scrollspy.js',
    paths.scripts + 'bootstrap/tab.js',
    paths.scripts + 'bootstrap/affix.js',
    paths.scripts + 'scripts.js'
  ],
  jsOutputFileName : pkg.name + ".js"
};

// Clean build directory
gulp.task("clean", function () {
  gutil.log(gutil.colors.yellow('Cleaning generated files.'));

  return gulp.src(paths.build, {read: false})
    .pipe(clean());
});

// Compile LESS files from /less into /css
gulp.task('less', function() {
  gutil.log(gutil.colors.yellow('Compiling LESS files to CSS files.'));

  return gulp.src(inputFiles.lessEntryPointFile)
    .pipe(less({
      paths: ["."] // Specify search paths for @import directives
    }))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest(paths.build + 'css/'))
    // Minify compiled CSS
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.build + 'css/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Concatenates JS files and minified
gulp.task('js', function() {
  gutil.log(gutil.colors.yellow('Minifying JS files.'));

  return gulp.src(inputFiles.jsInputFiles)
    .pipe(header(banner, { pkg: pkg }))
    .pipe(concat(inputFiles.jsOutputFileName))
    .pipe(gulp.dest(paths.build + 'js/'))
    // Minify JS
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.build + 'js/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Compile all EJS templates to HTML
var json = JSON.parse(filesys.readFileSync(inputFiles.htmlConfigJSON)); // parse json
gulp.task("templates", function() {
  gutil.log(gutil.colors.yellow('Compiling EJS templates to HTML files.'));

  return gulp.src(inputFiles.htmlInputFiles)
    .pipe(ejs(json, {ext:'.html'}).on('error', gutil.log))
    .pipe(gulp.dest(paths.build))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Copy vendor libraries from /bower_components into /vendor
gulp.task('copy', function() {
  gulp.src([
    paths.bower_components + 'font-awesome/css/font-awesome.min.css'
  ])
    .pipe(gulp.dest('dist/css'));

  gulp.src([
    paths.node_modules + 'jquery/dist/jquery.min.js'
  ])
    .pipe(gulp.dest('dist/js'));

  gulp.src([
    paths.assets + 'fonts/glyphicons/*.{eot,svg,ttf,woff,woff2}',
    paths.bower_components + 'font-awesome/fonts/*.{eot,svg,ttf,woff,woff2}'
  ])
    .pipe(gulp.dest('dist/fonts'));
});

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    ui: {
      port: 3944
    },
    server: {
      baseDir: paths.build,
      index: "index.html"
    },
    port: 7947
  });
});

// Reload Browser
gulp.task('bsReload', function() {
  return browserSync.reload();
});

// Run everything
gulp.task('default', ['clean', 'browserSync'], function() {
  gulp.start('dev');
});

// Dev task with browserSync
gulp.task('dev', ['copy', 'templates', 'less', 'js'], function() {
  gulp.watch(inputFiles.lessFiles, ['less']);
  gulp.watch(inputFiles.jsInputFiles, ['js']);
  gulp.watch([inputFiles.htmlConfigJSON, paths.templates + '*.ejs'], ['templates', 'bsReload']);
  // Reloads the browser whenever HTML, CSS or JS files change
  gulp.watch(paths.build + '*.html', ['bsReload']);
  gulp.watch([paths.build + 'css/*.css', '!' + paths.build + 'css/*.min.css'], ['bsReload']);
  gulp.watch([paths.build + 'js/*.js', '!' + paths.build + 'js/*.min.js'], ['bsReload']);
});
