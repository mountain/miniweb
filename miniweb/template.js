var fs   = require("fs"),
    path = require('path'),
    _    = require('underscore');

var logger = require('./logger'),
    walk = require('./environment').walk;

function loadTmpl(path, context, name) {
    logger.info('loading template: ' + path);
    try {
        var data = fs.readFileSync(path);
        name = name.substring(0, name.length - 4);
        context[name] = _.template(
          data.toString('utf8', 0, data.length)
        );
    } catch (e) {
        logger.error('Error parsing template: ' + e);
    }
}

exports.load = function (env, callback) {
    logger.info('loading templates...');
    var ctx = (env.templates = {});
    walk([env.path, 'app', 'templates'].join('/'), ctx, loadTmpl);

    var dirname = [env.path, 'modules'].join('/'),
        last = env.subapps.length - 1;
    env.subapps.forEach(function (appname, index, appnames) {
        var name = path.join(dirname, appname);
        walk([name, 'app', 'templates'].join('/'), ctx, loadTmpl,
        function () {
            if (index === last) {
                callback();
            }
        });
    });
};
