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

gulp.task('build:html', function() {
  return gulp.src(['**/*.html', '!node_modules/**', '!build/**'])
    .pipe(plumber())
    .pipe(htmlmin({
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      minifyCSS: true,
      minifyJs: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeEmptyElements: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    }))
    .pipe(plumber.stop())
    .pipe(gulp.dest('./build'));
});

gulp.task('build:js', function() {
  return gulp.src(['js/*.js'])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./build/js'));
});

gulp.task('build:css', function() {
  return gulp.src(['**/*.css', '!node_modules/**', '!build/**'])
    .pipe(plumber())
    .pipe(cleanCSS())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./build'));
});

gulp.task('build:sounds', function() {
  return gulp.src('sounds/*.mp3')
    .pipe(gulp.dest('./build/sounds'));
});

gulp.task('build', ['build:html', 'build:js', 'build:css', 'build:sounds'], function() {
  return gulp.src('build/**/*.*')
    .pipe(size({
      showFiles: true,
      gzip: true
    }));
});

gulp.task('connect', function() {
  browserSync.init({
    port: 8080,
    server: {
      baseDir: "./",
    }
  });
});

gulp.task('watch', function() {
  gulp.watch('js/**/*.js', ['lint', 'scripts', 'build']);
  gulp.watch(['**/*.html', '!node_modules/**'], ['build']);
});

gulp.task('default', ['lint', 'scripts', 'connect', 'watch']);