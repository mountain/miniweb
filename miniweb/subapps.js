var fs   = require("fs"),
    path = require('path'),
    _    = require('underscore');

var emitter = new (require('events').EventEmitter)();

var logger = require('./logger'),
    walk = require('./environment').walk;

exports.detect = function (env, callback) {
    logger.info('detecting subapps...');
    var ctx = (env.subapps = []);

    var dirname = [env.path, 'modules'].join('/');
    fs.readdir(dirname, function (err, relnames) {
        if (err) {
            logger.error('Error when reading subapps: ' + err);
            return;
        }
        relnames.forEach(function (relname, index, relnames) {
            var name = path.join(dirname, relname),
                counter = 0,
                listener = function () {
                    counter--;
                    //logger.info('counter: ' + counter);
                    if (counter === 0) {
                        callback();
                    }
                };

            emitter.on('found', listener);

            fs.stat(name, function (err, stat) {
                if (err) {
                    logger.error('Error when reading subapp directory: ' + err);
                    return;
                }
                if (stat.isDirectory()) {
                    logger.info('Found subapp: ' + name);
                    counter++;
                    ctx.push(name);
                    emitter.emit('found', name);
                }
            });
        });
    });

};
