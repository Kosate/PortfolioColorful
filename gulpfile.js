var gulp = require('gulp');
var ejs = require('gulp-ejs');
var scss = require('gulp-sass');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

var production = true;

gulp.task('move', function() {
    gulp.src([
        'app/**/*',
        '!app/bower_components/**/*',
        '!app/**/*.scss',
        '!app/**/*.es6',
        '!app/**/*.ejs',
        '!app/**/*.tmp',
        '!app/img/**/*'
    ], { base: 'app' })
        .pipe(gulp.dest('dist/'));
});

gulp.task('imageMin', function() {
    gulp.src('app/img/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img/'));
});

gulp.task('static', function() {
    var bowerList = [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/semantic/dist/semantic.min.css',
        'bower_components/semantic/dist/semantic.min.js',
        'bower_components/semantic/dist/themes/default/assets/**/*'

    ];

    gulp.run(['move', 'imageMin']);

    gulp.src(bowerList.map(function(val) { return 'app/' + val }), { base: 'app/bower_components/' })
        .pipe(gulp.dest('dist/bower_components/'));
});

gulp.task('watch', function() {

    browserSync.init({
        server: "dist/",
        port: 3002
    });

    gulp.run(['default']);
    gulp.watch('app/**/*.scss', ['scss']);
    gulp.watch('app/**/*.es6', ['es6']);
    gulp.watch('app/**/*.ejs', ['ejs']);
    gulp.watch([
        'app/**/*',
        '!app/bower_components/**/*',
        '!app/**/*.scss',
        '!app/**/*.es6',
        '!app/**/*.ejs',
        '!app/**/*.tmp',
        '!app/img/**/*'
    ], ['move']);

    gulp.watch(['dist/**/*','!dist/img/**/*', '!dist/bower_components/**/*']).on('change', browserSync.reload);
});

gulp.task('clean', function() {
    gulp.src('dist/**/*.*')
        .pipe(clean({ force: true }));
});

gulp.task('scss', function() {
    gulp.src('app/**/*.scss')
        .pipe(plumber())
        .pipe(scss().on('error', scss.logError))
        .pipe(gulpif(production, sourcemaps.init()))
        .pipe(gulpif(production, minifyCss()))
        .pipe(gulpif(production, sourcemaps.write('maps/')))
        .pipe(gulp.dest('dist/'));
});

gulp.task('es6', function() {
    gulp.src('app/**/*.es6')
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulpif(production, sourcemaps.init()))
        .pipe(gulpif(production, uglify()))
        .pipe(gulpif(production, sourcemaps.write('maps/')))
        .pipe(gulp.dest('dist/'));
});

gulp.task('ejs', function() {
    gulp.src('app/**/*.ejs')
        .pipe(plumber())
        .pipe(ejs())
        .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['scss', 'es6', 'ejs', 'static']);
