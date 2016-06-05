/**
 * 安装步骤：
 * 1、安装nodejs(https://nodejs.org/en/)
 * 2、安装依赖项。在命令行中执行：npm install
 * 3、npm install -g gulp
 * 4、npm install -g grunt
 *
 *
 *
 */




var gulp = require('gulp'),
    minifyCss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    del = require('del');

var rev = require('gulp-rev');
//- 对文件名加MD5后缀

var revCollector = require('gulp-rev-collector');
//- 路径替换


//压缩CSS
gulp.task('minifyCommonCss', function () {

    var cssArray=[
        "./public/lib/layer/skin/layer.css",
        "./public/src/theme/style.css",
        "./public/src/theme/fontello.css"
    ];

    return gulp.src(cssArray).pipe(concat('coolpeng.css'))
        .pipe(gulp.dest('./public/release/css/'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifyCss())
        .pipe(gulp.dest('./public/release/css/'))
        .pipe(rev())
        .pipe(gulp.dest('./public/release/css/'))
        .pipe(rev.manifest("minifyCommonCss.json"))
        .pipe(gulp.dest('./public/release/rev'));
});


//压缩js
gulp.task('minifyCommonJS', function() {


    var jsArray = [
        './bower_components/ejs/ejs.min.js',
        './public/lib/layer/layer.js',
        "./public/src/theme/theme.js",
        './public/src/js/ajax-link.js',
        './public/src/js/blog-i18n.js',
        './public/src/js/blog-index.js'
    ];

    return gulp.src(jsArray).pipe(concat('coolpeng.js'))
        .pipe(gulp.dest('./public/release/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('./public/release/js'))
        .pipe(rev())
        .pipe(gulp.dest('./public/release/js'))
        .pipe(rev.manifest("minifyCommonJS.json"))
        .pipe(gulp.dest('./public/release/rev'));
});


gulp.task('revEjsTemplate', function() {
    gulp.src(['./public/release/rev/*.json', './views/layout.ejs'])
        .pipe(revCollector())
        .pipe(gulp.dest('./views/release'));
});


gulp.task('copyTheme', function() {
    gulp.src(['./public/src/theme/font/*'])
        .pipe(gulp.dest('./public/release/css/font/'));

    gulp.src(['./public/src/theme/img/*'])
        .pipe(gulp.dest('./public/release/css/img/'));
});



/**
 * 执行所有压缩任务，任务并行执行。
 */
gulp.task('default', ['minifyCommonJS', 'minifyCommonCss',"revEjsTemplate","copyTheme"]);
