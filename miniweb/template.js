var fs = require("fs"),
    _ = require('underscore');

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
    logger.info('loading tempaltes...');
    var ctx = (env.templates = {});
    walk([env.path, 'app', 'templates'].join('/'), ctx, loadTmpl, callback);
};
