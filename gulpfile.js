var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var fs = require('fs');
var handlebars = require('gulp-compile-handlebars');
const rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
const hb = require('gulp-hb');


// Development Tasks
// -----------------

// Start browserSync server
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: 'dist',
        }
    })
});

// Compiles sass into Assets

// ... variables
var autoprefixerOptions = {
    browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};

gulp.task('sass', function () {
    return gulp
        .src('src/sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(sourcemaps.write())
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(gulp.dest('dist/assets/css'))
        .pipe(browserSync.stream());
});

gulp.task('handlebars', function () {
    return gulp.src('src/templates/**/*.hbs')
        .pipe(hb()
            .partials('src/partials/**/*.hbs')
            .helpers({
                templateName: function (item) {
                    return item.path.substring(item.base.length);
                },
                templateIs: function (item, templateName, className) {
                    return item.path.substring(item.base.length) === templateName ? className : "";
                }
            })
        )
        .pipe(rename(function(path) {
            path.extname = '.html';
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.stream());
});


// Watchers
gulp.task('watch', function() {
    gulp.watch('src/sass/**/*.scss', ['sass']);
    gulp.watch('src/js/**/*.js', ['pack-js']);
    gulp.watch('src/*.html', browserSync.reload);
    gulp.watch('src/templates/*.hbs', ['handlebars']);
    gulp.watch('src/partials/*.hbs', ['handlebars']);
});

// Optimization Tasks
// ------------------

// Optimizing CSS and JavaScript
gulp.task('useref', function() {

    return gulp.src('src/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('dist/assets'));
});

// Optimizing Images
gulp.task('images', function() {
    return gulp.src('src/images/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true,
        })))
        .pipe(gulp.dest('dist/assets/images'))
});

// Copying fonts
gulp.task('fonts', function() {
    return gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/assets/fonts'))
});

// Cleaning
gulp.task('clean', function () {
    del.sync(['./dist/**']);
});

gulp.task('pack-js', function () {
    return gulp.src(['src/js/jquery.js', 'src/js/plugins/*.js', 'src/js/main.js'])
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('dist/assets/js'))
        .pipe(browserSync.stream());
});


// Build Sequences
// ---------------

gulp.task('default', function(callback) {
    runSequence(['sass', 'handlebars', 'images', 'pack-js', 'fonts', 'browserSync', 'clean'], 'watch',
        callback
    )
});

gulp.task('build', function(callback) {
    runSequence(
        'clean',
        'sass',
        ['images', 'fonts', 'pack-js'],
        callback
    )
});