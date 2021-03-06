/**
 * Launchpad Configuration
 *
 * 1. Edit the variables as per your project requirements.
 * 2. In paths you can add <<glob or array of globs>>.
 *
 * @package Launchpad
 */

module.exports = {
    /**
     * CSS Handling Options
     */

    // Path to main .scss file.
    styleEntry: './assets/scss/main.scss', // Path to main .scss file.

    // Browser Compatibility
    BROWSERS_LIST: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'last 2 Chrome versions',
        'las2 2 Firefox versions',
        'last 2 Safari versions',
        'last 2 Edge versions',
        'last 2 Opera versions',
        'last 2 iOS versions',
        'last 1 Android versions',
        'last 1 ChromeAndroid versions',
        'ie >= 11',
    ],


    /**
     * Javascript Handling Options
     */

    // Javascript Entry File
    jsEntry: './assets/js/main.js',


    /**
     * Image Handling Options
     */

    // Image Source Folder
    imgSource: './assets/img/**/*',


    /**
     * Included File Options
     */

    // Includes Source Folder
    incSource: './assets/inc/**/*',


    /**
     * Watch File Paths
     */

    // CSS Files
    watchStyles: './assets/scss/**/*.scss',

    // Scripts
    watchScripts: './assets/js/**/*.js',

    // HTML Files
    watchViews: './html/**/*.html',
};
