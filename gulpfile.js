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

gulp.task('build:html', function() {
  return gulp.src(['**/*.html', '!node_modules/**', '!build/**', '!bower_components/**'])
    .pipe(changed('./build'))
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
    .pipe(gulp.dest('./build'));
});

gulp.task('build:js', function() {
  return gulp.src(['js/*.js'])
    .pipe(changed('./build'))
    .pipe(plumber())
    .pipe(uglify())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./build/js'));
});

gulp.task('build:sass', function() {
  return gulp.src(['sass/*.scss'])
    .pipe(changed('./build'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./styles'));
});

gulp.task('build:css', function() {
  return gulp.src(['**/*.css', '!node_modules/**', '!build/**'])
    .pipe(changed('./build'))
    .pipe(plumber())
    .pipe(cleanCSS())
    .pipe(plumber.stop())
    .pipe(gulp.dest('./build'));
});

gulp.task('build:media', function() {
  return gulp.src(['media/*.*'])
    .pipe(changed('./build'))
    .pipe(gulp.dest('./build/media'));
});

gulp.task('build', ['build:html', 'build:js', 'build:sass', 'build:css', 'build:media'], function() {
  // only show files that display on the main page as everything else is lazy loaded
  return gulp.src(['build/index.html', 'build/styles/arcade.css', 'build/js/kontra.min.js', 'build/js/arcade.js', 'build/js/preview.js', 'build/media/bg.png', 'build/media/arcade.svg'])
    .pipe(size({
      showFiles: true,
      gzip: true
    }));
});

// gulp.task('sizeHomePage', ['build'], function() {
//   return gulp.src(['build/index.html', 'build/styles/arcade.css', 'build/js/kontra.min.js', 'build/js/scripts.js', 'build/js/preview.js', 'build/media/bg.png', 'build/media/arcade.svg'])
//     .pipe(size({
//       showFiles: true,
//       gzip: true
//     }));
// });

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
  gulp.watch('js/**/*.js', ['lint', 'scripts', 'build']);
  gulp.watch(['**/*.html', '!node_modules/**'], ['build']);
  gulp.watch('sass/*.scss', ['build'])
});

gulp.task('default', ['lint', 'scripts', 'build', 'connect', 'watch']);