var gulp = require('gulp');
var mainBower = require('main-bower-files');
var less = require("gulp-less");

gulp.task('build:bower:js', function () {
    return gulp.src(mainBower({ filter: "**/*.js" }))
        .pipe(gulp.dest('./public/javascripts'));
});

gulp.task('build:bower:less', function () {
    return gulp.src(mainBower({ filter: "**/*.less" }))
        .pipe(less())
        .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('build:bower:css', function () {
    return gulp.src(mainBower({ filter: "**/*.css" }))
        .pipe(less())
        .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('build', ['build:bower:js', 'build:bower:less', 'build:bower:css']);