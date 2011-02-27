var fs   = require("fs"),
    path = require('path'),
    _    = require('underscore');

var logger = require('./logger'),
    walk = require('./environment').walk;

function loadCtrl(path, context, name) {
    logger.info('loading controller[' + name + ']: ' + path);
    context[name.split('.')[0]] = path;
}

exports.load = function (env, callback) {
    logger.info('loading controllers...');
    var ctx = (env.controllers = {});
    walk([env.path, 'app', 'controllers'].join('/'), ctx, loadCtrl);

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
                if(err) {
                    logger.error('Error when reading subapp directory: ' + err);
                    return;
                }
                if(stat.isDirectory()) {
                    logger.error('Found subapp: ' + name);
                    counter++;
                    //logger.info('counter: ' + counter);
                    walk([name, 'app', 'controllers'].join('/'), ctx, loadCtrl,
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
