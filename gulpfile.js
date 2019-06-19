var gulp = require('gulp')
   var uglify = require('gulp-uglify')
   var rename = require('gulp-rename')
   var clean_css = require('gulp-clean-css')
   var babel = require('gulp-babel')
   var concat = require('gulp-concat');
   var htmlmin = require('gulp-htmlmin');
   var connect = require('gulp-connect');
   
    gulp.task('js', function() {
        // 1. 找到文件
    gulp.src(['js/index.js','js/main.js'])
        // 2. 压缩文件
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(uglify())
            .pipe(concat('all.min.js'))
            // .pipe(rename({suffix: '.min'}))
            // 3. 另存压缩后的文件
            .pipe(gulp.dest('dist'));
    });


   gulp.task('css',function(){
    gulp.src('css/index.css')
        .pipe(clean_css())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist'))
   })


   gulp.task('html', function () {
        var options = {
            removeComments: true,//清除HTML注释
            collapseWhitespace: true,//压缩HTML
            collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
            removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
            removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
            minifyJS: true,//压缩页面JS
            minifyCSS: true//压缩页面CSS
        };
        gulp.src('index.html')
            .pipe(htmlmin(options))
            .pipe(gulp.dest('dist'));
    });

    gulp.task('webserver', function() {
        connect.server({
            host: '0.0.0.0',
            livereload: true,
            port: 8888
        });
    });

   gulp.task('c',['js','css'])