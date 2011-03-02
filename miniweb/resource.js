var fs   = require("fs"),
    path = require('path'),
    _    = require('underscore');

var logger = require('./logger'),
    copydir = require('../lib/fsutil').copydir,
    postwalk = require('../lib/fsutil').postwalk;

function deleteFile(path, context, name) {
    logger.info('delete file at: ' + path);
    try {
        fs.unlink(path);
    } catch (e) {
        logger.error('Error deleting files in public folder: ' + e);
    }
}

function deleteDir(path, context, name) {
    logger.info('delete dir at: ' + path);
    try {
        fs.rmdir(path);
    } catch (e) {
        logger.error('Error deleting directories in public folder: ' + e);
    }
}

exports.clear = function (env, callback) {
    logger.info('clearing public folder...');
    try {
        postwalk([env.path, 'public'].join('/'), deleteFile, deleteDir, callback);
    } catch (e) {
        logger.error('Error clearing public folder: ' + e);
    }
};

exports.load = function (env, callback) {
    logger.info('loading resources...');
    copydir([env.path, 'resources'].join('/'),
                            [env.path, 'public'].join('/'));

    var dirname = [env.path, 'modules'].join('/')
    fs.readdir(dirname, function (err, relnames) {
        if (err) {
            logger.error('Error when reading subapps: ' + err);
            return;
        }
        relnames.forEach(function (relname, index, relnames) {
            var name = path.join(dirname, relname),
                counter = 0;
            fs.stat(name, function (err, stat) {
                if (err) {
                    logger.error('Error when reading subapp directory: ' + err);
                    return;
                }
                if (stat.isDirectory()) {
                    logger.info('Found subapp: ' + name);
                    counter++;
                    //logger.info('counter: ' + counter);
                    copydir([name, 'resources'].join('/'),
                            [env.path, 'public'].join('/'),
                    function () {
                        counter--;
                        //logger.info('counter: ' + counter);
                        if (counter === 0) {
                            callback();
                        }
                    });
                }
            });
        });
    });
};
