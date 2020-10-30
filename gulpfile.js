const { src, dest, watch, series, parallel, lastRun } = require("gulp");
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const notify  = require('gulp-notify');
const browserSync = require('browser-sync');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const babelify = require('babelify');
const pug = require('gulp-pug');
const del = require("del");

const app = './src/';
const distpath = './dist/';

const paths = {
  dist: "./dist/assets",
  scripts: {
    src: './src/js/app.js',
    watch: ['./src/js/{,**/}*.js'],
    dest: './dist/assets/js'
  },
  html: {
    src: ['./src/pug/{,**/}*.pug', "!" + './src/pug/{,**/}_*.pug'],
    watch: ['./src/pug/{,**/}*.pug'],
    dest: './dist/'
  }
};

const browserSyncOption = {
  injectChanges: true,
  open: true,
  reloadOnRestart: true,
  server: {
      baseDir: distpath
  }
};

const browsersync = () => {
  browserSync(browserSyncOption);
}
const browserReload = (done) => {
  browserSync.reload();
  done();
};

const jsbuild = () => browserify({ debug: true })
  .add( [paths.scripts.src] )
  .on("error", function (err) { console.log("Error : " + err.message); })
  .transform(babelify.configure({
      presets : ["@babel/preset-env"]
  }))
  .bundle()
  .pipe(source("bundle.js"))
  .pipe(buffer())
  // .pipe(uglify())
  .pipe(dest(paths.scripts.dest));


const pugbuild = () => src(paths.html.src)
  .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
  }))
  .pipe(pug({ pretty: true }))
  .pipe(dest( paths.html.dest ) )
  .pipe(browserSync.stream());

const clean = () => del([ paths.dist ]);

const watchTask = (done) => {
  watch(paths.scripts.watch, series(jsbuild, browserReload))
  watch(paths.html.watch, series(pugbuild, browserReload))
  done();
}

exports.build = series(clean, parallel(jsbuild, pugbuild));

exports.default = series(
  parallel(jsbuild, pugbuild), watchTask, browsersync
);
