const path = require('path');
const fs = require('fs');
const gulp = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnext = require('postcss-cssnext');
const FlexbugsFixes = require('postcss-flexbugs-fixes');
const data = require('gulp-data');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');

const postcssProcessors = [
  cssnext({browsers: ['> 1%', 'last 2 version']}),
  FlexbugsFixes
];

gulp.task('webserver', function() {
  browserSync.init({
    server: {
      baseDir: "public"
    }
  });
});

gulp.task('sass', () => {
  gulp.src('./src/assets/css/**/*.scss')
    .pipe(plumber())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(postcss(postcssProcessors))
    .pipe(gulp.dest('./public/assets/css'))
    .pipe(browserSync.stream());
});

gulp.task('build:sass', () => {
  gulp.src('./src/assets/css/**/*.scss')
    .pipe(plumber())
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(postcss(postcssProcessors))
    .pipe(gulp.dest('./public/assets/css'))
});

gulp.task('pug', () => {
  const locals = {
    'site': JSON.parse(fs.readFileSync('./src/site.json'))
  }
  return gulp.src(['./src/**/*.pug', '!./src/**/_*.pug'])
    .pipe(plumber())
    .pipe(data(function(file) {
      locals.relativePath = path.relative(file.base, file.path.replace(/.pug$/, '.html'));
      locals.site.url = "http://localhost:3000/";
      return locals;
    }))
    .pipe(pug({
      locals: locals,
      pretty: true,
      basedir: 'src'
    }))
    .pipe(gulp.dest('./public'))
    .pipe(browserSync.stream());cd  
});

gulp.task('build:pug', () => {
  const locals = {
    'site': JSON.parse(fs.readFileSync('./src/site.json'))
  }
  locals.site.url = locals.site.urls[`${process.env.NODE_ENV}`];
  locals.site.ogpImage = `${locals.site.urls[`${process.env.NODE_ENV}`]}${locals.site.ogpImage}`;
  return gulp.src(['./src/**/*.pug', '!./src/**/_*.pug'])
    .pipe(plumber())
    .pipe(data(function(file) {
      locals.relativePath = path.relative(file.base, file.path.replace(/.pug$/, '.html'));
      return locals;
    }))
    .pipe(pug({
      locals: locals,
      pretty: true,
      basedir: 'src'
    }))
    .pipe(gulp.dest('./public'))
});

gulp.task('copy-image', function() {
  return gulp.src(['src/**/*.svg', 'src/**/.gif', 'src/**/*.png', 'src/**/*.jpg'])
  .pipe(gulp.dest('public'));
});

gulp.task('copy-js', function() {
  return gulp.src(['src/**/*.js'])
  .pipe(gulp.dest('public'));
});

gulp.task('watch', ["pug", "sass", "webserver", "copy-image", "copy-js"], () => {
  gulp.watch('./src/**/*.pug',['pug']);
  gulp.watch('./src/assets/css/**/*.scss', ['sass']);
  gulp.watch('./src/assets/js/**/*.js', ['copy-js']);
});

gulp.task('build', ["build:sass", "build:pug", "copy-image", "copy-js"]);