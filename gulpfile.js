const gulp = require('gulp'),
      pug  = require('gulp-pug'),
      fs   = require('fs'),
      browserSync = require('browser-sync').create(),
      reload = browserSync.reload,
      plumber = require('gulp-plumber'),
      sass    = require('gulp-sass'),
      spritesmith = require('gulp.spritesmith'),
      sassGlob = require('gulp-sass-glob'),
      sourcemaps = require('gulp-sourcemaps'),
      csso = require('gulp-csso'),
      autoprefixer = require('gulp-autoprefixer'),
      cssunit = require('gulp-css-unit'),
      wait = require('gulp-wait');


gulp.task('img:dev', () => {
    return gulp.src('./src/assets/**/*.{png,jpg,gif,svg}')
        .pipe(gulp.dest('./build/assets/'));
});

gulp.task('sass', () => {
    return gulp.src('./src/styles/main.scss')
        .pipe(wait(200))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['> 5%'],
            cascade: false
        }))
        // .pipe(cssunit({
        // type: 'px-to-rem',
        // rootSize: 16    
        //}))
        .pipe(csso())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css/'))
        .pipe(reload({stream: true}));
});

gulp.task('fonts', () => {
    return gulp.src('./src/styles/fonts/**/*.*')
        .pipe(gulp.dest('./build/css/fonts'));
});

gulp.task('pug', () => {
    // let locals = require('./content.json');

    gulp.src('./src/templates/*.pug')
        .pipe(plumber())
        .pipe(pug({
            locals: {
                content: JSON.parse(fs.readFileSync('./data/content.json', 'utf-8'))
            },
            pretty: true
        }))
        .pipe(gulp.dest('./build'))
        .pipe(reload({ stream: true }));
});

gulp.task('scripts', () => {

  gulp.src('./src/js/main.js')
    .pipe(gulp.dest('./build/js/'))
    .pipe(reload({ stream: true }));

});

gulp.task('server', () => {
    browserSync.init({
        open: true,
        notify: false,
        server: {
            baseDir: "./build"
        }
    });
});

gulp.task('sprite', () => {
    var spriteData = gulp.src(
        './src/assets/img/icons/*.png'
    ).pipe(spritesmith({
        imgName: 'sprite.png',
		cssName: 'sprite.scss',
		cssFormat: 'css',
		imgPath: './src/assets/img/icons/sprite.png',
		padding: 70
    }));

    spriteData.img.pipe(gulp.dest('./build/assets/img/icons'));
	spriteData.css.pipe(gulp.dest('./src/styles/sprite'));
});

gulp.task('watch', () => {
    gulp.watch('src/templates/**/*.pug', ['pug']);
    gulp.watch('src/styles/**/*.scss', ['sass']);
    gulp.watch('src/js/main.js', ['scripts']);
});

// gulp.task('default', ['sass', 'pug', 'sprite', 'img:dev', 'server', 'watch']);
gulp.task('default', [ 'sass', 'pug', 'scripts', 'sprite', 'fonts', 'img:dev', 'server', 'watch',]);