/**
 * -----------------------------------------------------------------------------
 * Gulpfile
 *
 * Licensed under GPL v3.0:
 * https://github.com/jdaio/front-end-gulp/blob/master/LICENSE
 *
 * @license GPL-3.0-or-later
 *
 * @overview Handles all file processing tasks, as well as BrowserSync, etc.
 *
 * @author Jamal Ali-Mohammed (https://jdaio.github.io)
 *
 * @version 1.0.0
 * -----------------------------------------------------------------------------
 */

/**
 * -----------------------------------------------------------------------------
 * Module Import & Settings
 * -----------------------------------------------------------------------------
 */

// Import plugins not supported by 'gulp-load-plugins'.
import fs from 'fs';
import path from 'path';

import gulp from 'gulp';

import archiver from 'archiver';
import argv from 'yargs';
import babelify from 'babelify';
import browserify from 'browserify';
import browserSync from 'browser-sync';
import del from 'del';
// import modernizr from 'modernizr';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';

// Load all gulp plugins automatically and attach them to the 'plugins' object.
import plugins from 'gulp-load-plugins';

// Import configuration and package.json for development use.
import config from './config';
import pkg from './package.json';

// Store project directories in 'dirs' variable for later access.
const dirs = pkg.directories;

// List of default project directory keys used to verify exist in 'dirs'.
const checkDirs = [
    'archive',
    'build',
    'dist',
    'docs',
    'src',
];

// Import Modernizr configuration.
// import modernizrConfig from './modernizr-config.json';

/**
 * -----------------------------------------------------------------------------
 * Startup Checks
 *
 * @description Checks to see if conditions are met before proceeding with the
 *              gulp tasks.
 * -----------------------------------------------------------------------------
 */

// Function to manually exit Gulpfile on error.
function exitGulpFile(err) {
    // Check if an error message was passed into the function.
    const errorMessage = err.length > 0
        ? err
        : 'An error has occurred. Gulp task terminated.';

    // Exit the gulp process with the appropriate method.
    throw Error(errorMessage);
}

// Gulpfile startup checks.
function initGulpfile() {
    // Check if the proper directories are available.
    checkDirs.forEach((dir) => {
        // Exit the process if there's a directory mismatch.
        if (!(dir in dirs)) exitGulpFile('There is a problem with directory verification. Please make sure all of the proper directories are in the package.json file.');
    });
}

initGulpfile();


/**
 * -----------------------------------------------------------------------------
 * Helper Variables, Functions & Tasks
 * -----------------------------------------------------------------------------
 */

// Import Reusable Variables from Configuration
const cssEntry = config.cssEntry.length > 0 ? config.cssEntry : 'style';
const cssInclude = config.cssInclude.length > 0 ? config.cssInclude : [];
const cssPlugins = config.cssPlugins.length > 0 ? config.cssPlugins : [];

const jsEntry = config.jsEntryName.length > 0 ? config.jsEntryName : 'index';
const jsOutput = config.jsOutputName.length > 0 ? config.jsOutputName : 'bundle';
const jsSrc = `${dirs.src}/assets/js/${jsEntry}.js`;
const jsDestBuild = `${dirs.build}/assets/js`;

const viewFileTypes = config.viewFileTypes.length > 0 ? config.viewFileTypes.join(',') : ['html'].join(',');

// Setup date variables for proper timestamps.
const today = new Date();
const year = today.getFullYear();

// Establish Variables for watching file types and directories.
const srcPaths = {
    css: `${dirs.src}/assets/css/**/*.scss`,
    js: `${dirs.src}/assets/js/**/*.js`,
    views: `${dirs.src}/**/*.{${viewFileTypes}}`,
    img: `${dirs.src}/assets/img/**`,
    inc: `${dirs.src}/assets/inc/**/*.*`,
};

// Script / Text Replacements for View Files
const defaultViewEnvironmentVariables = {
    APP_CSS: `assets/css/${cssEntry}.min.css`,
    APP_JS: `assets/js/${jsOutput}.min.js`,
};

const customViewEnvironmentVariables = Object.keys(config.viewEnvironmentVariables).length > 0
    ? config.viewEnvironmentVariables : {};

// Setup function to boot up BrowserSync for live reloads & CSS injections.
function launchBrowserSync() {
    const bsBrowserAutoOpen = config.bsBrowserAutoOpen.length > 0
        ? config.bsBrowserAutoOpen
        : false;
    const bsGhostMode = config.bsGhostMode.length > 0
        ? config.bsGhostMode
        : false;
    const bsNotify = config.bsNotify.length > 0
        ? config.bsNotify
        : false;
    const bsScrollProportionally = config.bsScrollProportionally.length > 0
        ? config.bsScrollProportionally
        : false;
    const bsInjectChanges = config.bsInjectChanges.length > 0
        ? config.bsScrollProportionally
        : true;

    browserSync.init({
        ghostMode: bsGhostMode,
        logPrefix: config.projectName,
        notify: bsNotify,
        open: bsBrowserAutoOpen,
        server: dirs.build,
        scrollProportionally: bsScrollProportionally,
        injectChanges: bsInjectChanges,
    });
}

// Helper function to allow browser reload with Gulp 4.
function reloadBrowserSync(done) {
    browserSync.reload();
    done();
}

// Helper task to clean all directories.
gulp.task('clean', (done) => {
    del([dirs.archive, dirs.build, dirs.dist, dirs.docs])
        .then(() => {
            done();
        });
});

/**
 * -----------------------------------------------------------------------------
 * Runtime Options
 * -----------------------------------------------------------------------------
 */

// Setup YARGS Arguments Here

/**
 * -----------------------------------------------------------------------------
 * Task - 'render:css'.
 *
 * @description Compiles, autoprefixes, processes and minifies SCSS, SASS and
 *              LESS to CSS.
 *
 * This task does the following:
 *      1. Gets the source SCSS file / entry point.
 *      2. Adds a production header to the main SCSS entry point.
 *      3. Compiles SCSS to CSS.
 *      4. Filters down gulp scope to first-processed CSS files.
 *      5. Initializes sourcemap generation.
 *      6. Processes CSS with PostCSS with minification.
 *      7. Renames the CSS file with the suffix '.min.css'.
 *      6. Generates the sourcemaps.
 *      7. Places the generated CSS file in the appropriate directory.
 *      8. Injects CSS into the BrowserSync stream.
 * -----------------------------------------------------------------------------
 */

gulp.task('render:css', () => {
    const banner = [
        '@charset \'UTF-8\';',
        '/*!',
        ` * ${config.projectName} v${pkg.version} (${pkg.homepage})`,
        ` * Author: ${pkg.author.name}`,
        ` * Author URI: ${pkg.author.url}`,
        ` * Copyright ${year}, ${pkg.author.name}`,
        ` * Licensed under ${pkg.license} (${config.projectLicenseURI})`,
        ' */\n\n',
    ].join('\n');

    let stream = gulp
        .src(`${dirs.src}/assets/css/${cssEntry}.scss`)
        .pipe(plugins()
            .header(banner))
        .pipe(plugins()
            .sass({
                includePaths: cssInclude,
                indentWidth: 4,
                outputStyle: 'expanded',
            })
            .on('error', plugins()
                .sass.logError))
        .pipe(plugins()
            .filter('**/*.css'))
        /* .pipe(plugins()
            .sourcemaps.init()) */
        .pipe(plugins()
            .postcss(cssPlugins))
        .pipe(plugins()
            .rename({
                suffix: '.min',
            }))
        /* .pipe(plugins()
            .sourcemaps.write()) */
        .pipe(gulp.dest(`${dirs.build}/assets/css`))
        .pipe(plugins()
            .filter('**/*.css'))
        .pipe(browserSync.stream());

    return stream;
});

/**
 * -----------------------------------------------------------------------------
 * Task - 'render:js'.
 *
 * @description Compiles and minifies Javascipt using Browserify.
 *
 * This task does the following:
 * -----------------------------------------------------------------------------
 */

gulp.task('render:js', () => {
    const bundler = browserify(jsSrc)
        .transform(babelify);

    const stream = bundler.bundle()
        .pipe(source(jsSrc))
        .pipe(buffer())
        .pipe(plugins().rename(`${jsOutput}.min.js`))
        /* .pipe(plugins().sourcemaps.init({
            loadMaps: true,
        })) */
        .pipe(plugins().uglify())
        // .pipe(plugins().sourcemaps.write())
        .pipe(gulp.dest(jsDestBuild))
        .pipe(browserSync.stream());

    return stream;
});

/**
 * -----------------------------------------------------------------------------
 * Task - 'render:views'.
 *
 * @description Processes view files and copies them to a destination folder.
 *
 * This task does the following:
 *      1. Collects all of the view files in the source directory.
 *      2. Runs the text replacement on each file.
 *      3. Checks for files that have been modified since the last run.
 *      4. Processes the changed files.
 *      5. Outputs files to the appropriate directory.
 * -----------------------------------------------------------------------------
 */

gulp.task('render:views', () => {
    const viewEnvironmentVariables = {
        ...defaultViewEnvironmentVariables,
        ...customViewEnvironmentVariables,
    };

    let stream = gulp.src(srcPaths.views, {
        since: gulp.lastRun('render:views'),
    });

    Object.keys(viewEnvironmentVariables).forEach((key) => {
        const regInput = new RegExp(`{{${key}}}`, 'g');
        const regReplace = viewEnvironmentVariables[key];

        stream = stream.pipe(plugins().replace(regInput, regReplace));
    });

    stream = stream.pipe(plugins()
        .newer(dirs.build))
        .pipe(plugins().stripComments())
        .pipe(gulp.dest(dirs.build))
        .pipe(browserSync.stream());

    return stream;
});

/**
 * -----------------------------------------------------------------------------
 * Task - 'render:img'.
 *
 * @description Minifies and readies images for production use.
 *
 * This task does the following:
 * -----------------------------------------------------------------------------
 */

gulp.task('render:img', () => {
    // Import GIF Optimization Options
    const imgGifInterlace = config.imgGifInterlace.length > 0
        ? config.imgGifInterlace
        : false;
    const imgGifOptimizationLevel = config.imgGifOptimizationLevel.length > 0
        ? config.imgGifOptimizationLevel
        : 1;
    const imgGifColors = config.imgGifColors.length > 0
        ? config.imgGifColors
        : 256;

    // Import JPEG Optimization Options
    const imgJpegProgressive = config.imgJpegProgressive.length > 0
        ? config.imgJpegProgressive
        : true;
    const imgJpegArithmetic = config.imgJpegArithmetic.length > 0
        ? config.imgJpegArithmetic
        : false;

    // Import PNG Optimization Options
    const imgPngOptimizationLevel = config.imgPngOptimizationLevel.length > 0
        ? config.imgPngOptimizationLevel
        : 3;
    const imgPngBitDepthReduction = config.imgPngBitDepthReduction.length > 0
        ? config.imgPngBitDepthReduction
        : true;
    const imgPngColorTypeReduction = config.imgPngColorTypeReduction.length > 0
        ? config.imgPngColorTypeReduction
        : true;
    const imgPngPaletteReduction = config.imgPngPaletteReduction.length > 0
        ? config.imgPngPaletteReduction
        : true;

    let stream = gulp
        .src(srcPaths.img, {
            since: gulp.lastRun('render:img'),
        })
        .pipe(plugins()
            .newer(dirs.build))
        .pipe(plugins().imagemin([
            plugins().imagemin.gifsicle({
                interlaced: imgGifInterlace,
                optimizationLevel: imgGifOptimizationLevel,
                colors: imgGifColors,
            }),
            plugins().imagemin.jpegtran({
                progressive: imgJpegProgressive,
                arithmetic: imgJpegArithmetic,
            }),
            plugins().imagemin.optipng({
                optimizationLevel: imgPngOptimizationLevel,
                bitDepthReduction: imgPngBitDepthReduction,
                colorTypeReduction: imgPngColorTypeReduction,
                paletteReduction: imgPngPaletteReduction,
            }),
            plugins().imagemin.svgo(config.imgSvgOpts),
        ]))
        .pipe(gulp.dest(`${dirs.build}/assets/img`))
        .pipe(browserSync.stream());

    return stream;
});

/**
 * -----------------------------------------------------------------------------
 * Task - 'render:inc'.
 *
 * @description Copies all included files to their respective directories.
 *
 * This task does the following:
 * -----------------------------------------------------------------------------
 */

gulp.task('render:inc', () => {
    let stream = gulp.src(srcPaths.inc, {
        since: gulp.lastRun('render:inc'),
    });

    stream = stream.pipe(plugins()
        .newer(dirs.build))
        .pipe(gulp.dest(`${dirs.build}/assets/inc`))
        .pipe(browserSync.stream());

    return stream;
});

/**
 * -----------------------------------------------------------------------------
 * Task - 'watch'.
 *
 * @description Watches files for changes.
 * -----------------------------------------------------------------------------
 */

gulp.task('watch', () => {
    gulp.watch(srcPaths.css, gulp.series('render:css'));
    gulp.watch(srcPaths.js, gulp.series('render:js'));
    gulp.watch(srcPaths.views, gulp.series('render:views'));
    gulp.watch(srcPaths.img, gulp.series('render:img'));
    gulp.watch(srcPaths.inc, gulp.series('render:inc'));
});

/**
 * -----------------------------------------------------------------------------
 * Task - 'render'.
 *
 * @description Overall file rendering.
 * -----------------------------------------------------------------------------
 */

gulp.task('render', gulp.parallel('render:css', 'render:js', 'render:views', 'render:img', 'render:inc'));

/**
 * -----------------------------------------------------------------------------
 * Task - 'build'.
 *
 * @description Renders all of the files and dependencies from the source
 *              directory.
 * -----------------------------------------------------------------------------
 */

gulp.task('build', gulp.series('clean', gulp.parallel('render', launchBrowserSync, 'watch')));

/**
 * -----------------------------------------------------------------------------
 * Task - 'docs'.
 *
 * @description Doesn't do a TON. Just copies the /dist folder to /docs for GH
 *              Pages use.
 * -----------------------------------------------------------------------------
 */

/* gulp.task('docs', gulp.series('dist', () => {
    const stream = gulp
        .src(dirs.dist)
        .pipe(gulp.dest(dirs.docs));

    return stream;
})); */

gulp.task('docs', () => {
    const stream = gulp
        .src('build/**/*')
        .pipe(gulp.dest(dirs.docs));

    return stream;
});

/**
 * -----------------------------------------------------------------------------
 * Task - 'default'.
 *
 * @description Default task for the gulpfile. Defaults to build & watch.
 * -----------------------------------------------------------------------------
 */

gulp.task('default', gulp.series('build', 'watch'));
