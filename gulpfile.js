var gulp = require('gulp');
var merge = require('merge2');
var path = require('path');
var run = require('gulp-run-command').default;
var sourcemaps = require('gulp-sourcemaps');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task('build', function() {
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return merge(

        tsResult.js
        .pipe(sourcemaps.write('.', {
            sourceRoot: function(file) { return file.cwd + '/src'; }
        }))
        .pipe(gulp.dest("dist")),

        tsResult.dts
        .pipe(gulp.dest("dist"))

    );
});

gulp.task('watch', function() {
    return gulp.watch('src/**/*.ts', ['build']);
});

gulp.task("doc", run('node_modules/.bin/typedoc --readme none --name "KofiLoop" --entryPoint "KofiLoop" --mode modules --theme node_modules/typedoc-clarity-theme/bin --excludeProtected --external-modulemap ".*/([\\w\\-_]+)/\" --out docs/ src/', {
    env: { NODE_ENV: 'production' }
}));

gulp.task('default', ['build', 'doc']);