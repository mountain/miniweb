var fs   = require("fs"),
    path = require('path'),
    _    = require('underscore');

var emitter = new (require('events').EventEmitter)();

var logger = require('./logger'),
    walk = require('./environment').walk;

exports.detect = function (env, callback) {
    logger.info('detecting subapps...');
    var ctx = (env.subapps = []),
        finished = function () {
        callback();
    };
    emitter.once('finished', finished);

    var dirname = [env.path, 'modules'].join('/');
    fs.readdir(dirname, function (err, relnames) {
        if (err) {
            logger.error('Error when reading subapps: ' + err);
            emitter.emit('finished');
            return;
        }

        var last = relnames.length - 1;
        if (last === -1) {
            emitter.emit('finished');
        }
        relnames.forEach(function (relname, index, relnames) {
            var name = path.join(dirname, relname);
            fs.stat(name, function (err, stat) {
                if (err) {
                    logger.error('Error when reading subapp directory: ' + err);
                    return;
                }
                if (stat.isDirectory()) {
                    logger.info('Found subapp: ' + name);
                    ctx.push(name);
                }
                if (index === last) {
                    emitter.emit('finished');
                }
            });
        });

    });
};
