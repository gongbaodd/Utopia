'use strict';
import gulp from 'gulp';
import gutil from 'gulp-util';
import gulpLoadPlugins from 'gulp-load-plugins';
import webpack from 'webpack';
import webpackConfig from './webpack.config.js';
import debug from 'gulp-debug';

const $ = gulpLoadPlugins();

gulp.task('webpack',(callback) =>{
    var _config = Object.create(webpackConfig);

    webpack(
        _config,
        (err, stats)=> {
            callback();
        }
    );
});
