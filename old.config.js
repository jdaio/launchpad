/**
 * -----------------------------------------------------------------------------
 * Project / Gulp Configuration
 *
 * In paths you can add <<glob or array of globs>>. Edit the variables as per
 * your project requirements.
 * -----------------------------------------------------------------------------
 */

module.exports = {
    /**
     * -------------------------------------------------------------------------
     * General Project Settings
     * -------------------------------------------------------------------------
     */

    // Proper name of the project.
    projectName: 'Hub & Spoke (2018)',

    // Project License URI
    projectLicenseURI: 'https://github.com/jdaio/hubandspoke-2018/blob/master/LICENSE',

    /**
     * -------------------------------------------------------------------------
     * General Development Settings
     * -------------------------------------------------------------------------
     */

    /**
     * BrowserSync Options
     */

    // Automatically open browser on start. [Boolean]
    bsBrowserAutoOpen: false,

    // Mirror actions on one device to all others. [Boolean]
    bsGhostMode: false,

    // Show pop-over notifications from BrowserSync. [Boolean]
    bsNotify: false,

    // Sync viewports to TOP position. [Boolean]
    bsScrollProportionally: false,

    // Inject changes instead of reloading. [Boolean]
    bsInjectChanges: true,

    /**
     * -------------------------------------------------------------------------
     * Render Settings
     * -------------------------------------------------------------------------
     */

    /**
     * SCSS Options
     */

    // Primary file name for the main CSS file. Omit the extension.
    cssEntry: 'main',

    // An array of directories to help gulp-sass resolve @import statements.
    // Use this to include CSS stylesheets from node modules.
    cssInclude: [],

    // An array of plugins to include with PostCSS.
    // Must be in `require('plugin-name')` format.
    cssPlugins: [
        require('css-mqpacker')({
            sort: true,
        }),
        require('cssnano')({
            autoprefixer: {
                browsers: [
                    'last 2 version',
                    '> .25%',
                    'ie >= 10',
                ],
            },
        }),
        // require('postcss-font-magician')({ /* Options. */ }),
    ],

    /**
     * Javascript Options
     */

    // Primary file name for the main JS file in the source. Omit the extension.
    jsEntryName: 'main',

    // Name of the outputted JS bundle in build/dist. Omit the extension.
    jsOutputName: 'bundle',

    // Default Vendor JS to Include
    // jsIncludeJquery: false,
    // jsIncludeModernizr: false,

    /**
     * View Options
     */

    // Array of filetypes used as view files.
    // Omit the leading '.' character.
    viewFileTypes: ['html', 'twig', 'php'],

    /*
     * Environment variables to be replaced in view files during processing.
     * Useful to avoid re-typing the same string over and over again.
     * In use, the keys will automatically be wrapped in `{{VARIABLE NAME}}`.
     *
     * The following variables are auto-defined, some can be overridden.
     * `(*)` denotes variables that shouldn't be modified.
     *
     * `APP_CSS`: Main CSS Stylesheet
     * `APP_JS`: Main JS Document
     */

    viewEnvironmentVariables: {},

    /**
     * Image Processing Options
     */

    // Gif Processing Options
    // https://github.com/imagemin/imagemin-gifsicle
    imgGifInterlace: false,
    imgGifOptimizationLevel: 2,
    imgGifColors: 256,

    // JPEG Processing Options
    // https://github.com/imagemin/imagemin-jpegtran
    imgJpegProgressive: true,
    imgJpegArithmetic: false,

    // PNG Processing Options
    // https://github.com/imagemin/imagemin-optipng
    imgPngOptimizationLevel: 5,
    imgPngBitDepthReduction: true,
    imgPngColorTypeReduction: true,
    imgPngPaletteReduction: true,

    // SVG Processing Options
    // https://github.com/svg/svgo
    imgSvgOpts: {
        plugins: [
            {
                removeViewBox: false,
            },
        ],
    },
};
