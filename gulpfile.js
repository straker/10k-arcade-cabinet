var gulp = require('gulp');
var connect = require('gulp-connect');
var eslint = require('gulp-eslint');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var size = require('gulp-size');
var gzip = require('gulp-gzip');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat-util');
var sass = require('gulp-sass');
var changed = require('gulp-changed');

var browserSync = require('browser-sync').create();

gulp.task('lint', function() {
  return gulp.src(['js/*.js', '!js/*.min.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('scripts', function() {
  return gulp.src(['js/preview/core.js', 'js/preview/*.js'])
    .pipe(concat('preview.js', {sep: '\n\n'}))
    .pipe(concat.header('(function(window, document, kontra) {\n'))
    .pipe(concat.footer('\n})(window, document, kontra);'))
    .pipe(gulp.dest('./js'));
});

gulp.task('dist:html', function() {
  return gulp.src(['**/*.html', '!node_modules/**', '!dist/**', '!bower_components/**'])
    .pipe(changed('./dist'))
    .pipe(plumber())
    .pipe(htmlmin({
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      minifyCSS: true,
      minifyJs: true,
      removeAttributeQuotes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    }))
    .pipe(plumber.stop())
    .pipe(gulp.dest('./dist'));
});

gulp.task('dist:js', function() {
  return gulp.src(['js/**/*.js', '!js/preview/*.js'])
    .pipe(changed('./dist'))
    .pipe(plumber())
    .pipe(uglify())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('dist:sass', function() {
  return gulp.src(['sass/*.scss'])
    .pipe(changed('./dist'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./styles'));
});

gulp.task('dist:css', function() {
  return gulp.src(['**/*.css', '!node_modules/**', '!dist/**'])
    .pipe(changed('./dist'))
    .pipe(plumber())
    .pipe(cleanCSS())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./dist'));
});

gulp.task('dist:media', function() {
  return gulp.src(['media/*.*'])
    .pipe(changed('./dist'))
    .pipe(gulp.dest('./dist/media'));
});

gulp.task('dist', ['dist:html', 'dist:js', 'dist:sass', 'dist:css', 'dist:media'], function() {
  // only show files that display on the main page as everything else is lazy loaded
  return gulp.src(['dist/index.html', 'dist/styles/arcade.css', 'dist/js/kontra.min.js', 'dist/js/arcade.js', 'dist/js/preview.js', 'dist/media/bg.png', 'dist/media/arcade.svg'])
    .pipe(size({
      showFiles: true,
      gzip: true
    }));
});

gulp.task('connect', function() {
  browserSync.init({
    port: 8080,
    open: false,
    server: {
      baseDir: "./",
    }
  });
});

gulp.task('watch', function() {
  gulp.watch('js/**/*.js', ['lint', 'scripts', 'dist']);
  gulp.watch(['**/*.html', '!node_modules/**'], ['dist']);
  gulp.watch('sass/*.scss', ['dist'])
});

gulp.task('default', ['lint', 'scripts', 'dist', 'connect', 'watch']);