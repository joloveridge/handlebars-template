var gulp = require('gulp'), watch = require('gulp-watch');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var fs = require('fs');
var handlebars = require('gulp-compile-handlebars');
const rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var clean = require('gulp-clean');
const minify = require('gulp-minify');

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

// Minify Javascript files
gulp.task('compress', function() {
    gulp.src(['src/js/**/*.js'])
        .pipe(minify())
        .pipe(gulp.dest('dist/assets/js'))
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
        .pipe(sourcemaps.write())
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(sass({outputStyle: 'compressed'})) // Options: nested, expanded, compact, compressed
        .pipe(gulp.dest('dist/assets/css'))
        .pipe(browserSync.stream());
});

gulp.task('handlebars', function () {
    let data = JSON.parse(fs.readFileSync('src/data.json'));
    let options = {
        ignorePartials: true,
        batch : ['templates/partials'], // Where partials go
        helpers : { // For the navigation
            eq: function(arg1, arg2, options) {
                return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
            }
        }
    };

    return gulp.src('templates/pages/**/*.hbs')
        .pipe(handlebars(data, options))
        .pipe(rename(function(path) {
            path.extname = '.html';
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.stream());
});

// Process and Optimizing Images
gulp.task('images', function() {
    return gulp.src('src/img/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true,
        })))
        .pipe(gulp.dest('dist/assets/img'))
});


// Watchers
gulp.task('watch', function() {
    gulp.watch('src/sass/**/*.scss', ['sass']);
    gulp.watch('src/js/**/*.js', ['pack-js']);
    gulp.watch('src/*.html', browserSync.reload);
    gulp.watch('templates/pages/**/*.hbs', ['handlebars']);
    gulp.watch('src/data.json', ['handlebars']);
    gulp.watch('templates/partials/*.hbs', ['handlebars']);
    gulp.watch('src/img/**/*.+(png|jpg|jpeg|gif|svg)', ['images']);
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

// Build Sequences
// ---------------

gulp.task('default', function(callback) {
    runSequence(['sass', 'handlebars', 'images', 'fonts', 'browserSync', 'compress', 'clean'], 'watch',
        callback
    )
});