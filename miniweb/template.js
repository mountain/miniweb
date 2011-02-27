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

    var dirname = [env.path, 'modules'].join('/')
    fs.readdir(dirname, function (err, relnames) {
        if (err) {
            logger.error('Error when reading subapps: ' + err);
            return;
        }
        relnames.forEach(function (relname, index, relnames) {
            var name = path.join(dirname, relname);
            counter += 1;
            fs.stat(name, function (err, stat) {
                if(err) {
                    finished(err);
                    return;
                }
                if(stat.isDirectory()) {
                    dcallback(name);
                    exports.walk(name, fcallback, dcallback, finished);
                } else {
                    fcallback(name);
                }
                counter -= 1;
                if(index === relnames.length - 1) counter -= 1;
                if(counter === 0) {
                    finished(null);
                }
            });
        });

};
