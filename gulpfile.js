var fs = require('fs');
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

gulp.task("test", run('node_modules/.bin/mocha --exit', {
    env: { NODE_ENV: 'production' }
}));

gulp.task('watch', function() {
    return gulp.watch('src/**/*.ts', ['build']);
});

gulp.task("doc:web", run('node_modules/.bin/typedoc --readme none --name "KofiLoop" --entryPoint "KofiLoop" --mode modules --theme node_modules/typedoc-clarity-theme/bin --excludeProtected --external-modulemap ".*/([\\w\\-_]+)/\" --out docs/ src/', {
    env: { NODE_ENV: 'production' }
}));

// Broken feature, need a patch from the author of the theme.
gulp.task("doc:dash", run('node_modules/.bin/typedoc --readme README.md --name "KofiLoop" --entryPoint "KofiLoop" --mode modules --theme node_modules/typedoc-dash-theme/bin --excludeProtected --external-modulemap ".*/([\\w\\-_]+)/\" --out docs/kofiloop.docset src/', {
    env: {
        NODE_ENV: 'production',
        TYPEDOC_DASH_ICONS_PATH: 'resources/icons'
    }
}));

gulp.task('doc', ['doc:web'], function(cb){
    fs.writeFile(__dirname + '/docs/CNAME', 'kofiloop.js.org', cb);
    // because .gitignore don't work very well with the CNAME file.
});

gulp.task('default', ['build', 'doc']);