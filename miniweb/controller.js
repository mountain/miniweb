var fs   = require("fs"),
    path = require('path');

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

    var dirname = [env.path, 'modules'].join('/'),
        last = env.subapps.length - 1;
    env.subapps.forEach(function (appname, index, appnames) {
        var name = path.join(dirname, appname);
        walk([name, 'app', 'controllers'].join('/'), ctx, loadCtrl,
        function () {
            if (index === last) {
                callback();
            }
        });
    });
};
