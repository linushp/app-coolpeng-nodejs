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
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    del = require('del');




//压缩CSS
gulp.task('minifyCommonCss', function () {

    var cssArray=[
        "./common/css/cm_button.css",
        "./common/css/cm_step.css",
        "./common/css/cm_table.css",
        "./common/css/cm_window.css",
        "./common/css/cm_mask.css",
        "./common/css/cm_loading.css",
        "./common/css/cm_upload.css",
        "./common/css/cm_layout.css",
        "./common/css/cm_validator.css",
        "./common/css/cm_interceptor.css",
        "./common/css/cm_placeholder.css",
        "./common/css/cm_fieldSelect.css",
        "./common/css/cm_editSelect.css",
        "./common/css/cm_selectArea.css",
        "./common/css/cm_header.css"
    ];

    return gulp.src(cssArray).pipe(concat('coolpeng.css'))
        .pipe(gulp.dest('./public/release/css/'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('./public/release/css/'));
});


//压缩js
gulp.task('minifyCommonJS', function() {


    var jsArray = [
        './bower_components/ejs/ejs.min.js',
        './public/lib/layer/layer.js',
        './public/src/js/ajax-link.js',
        './public/src/js/blog-index.js'
    ];

    return gulp.src(jsArray).pipe(concat('coolpeng.js'))
        .pipe(gulp.dest('./public/release/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('./public/release/js'));
});



/**
 * 执行所有压缩任务，任务并行执行。
 */
gulp.task('build', ['minifyCommonJS', 'minifyCommonCss']);
