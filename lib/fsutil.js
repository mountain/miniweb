var fs = require("fs"),
    path = require("path");


/**
 *  Asynchronous directory traversal in node.js
 *  Original by stygstra
 *  Modified by mountain
 *  https://gist.github.com/514983
 */
exports.walk = (function() {
    var counter = 0;
    var walk = function(dirname, fcallback, dcallback, finished) {
        counter += 1;
        fs.readdir(dirname, function(err, relnames) {
            if(err) {
                finished(err);
                return;
            }
            relnames.forEach(function(relname, index, relnames) {
                var name = path.join(dirname, relname);
                counter += 1;
                fs.stat(name, function(err, stat) {
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
        });
    };
    return walk;
})();

exports.mkdir = function (p) {
    var pathSegments = p.split("/");
    //sys.puts(pathSegments);
    if (pathSegments[0] === '') {
        pathSegments = pathSegments.slice(1);
    }
    for (var i = 0; i <= pathSegments.length; i++) {
        var pathSegment = "/" + pathSegments.slice(0, i).join("/");
        try {
            fs.statSync(pathSegment);
        } catch (e) {
            fs.mkdirSync(pathSegment, 0777);
        }
    }
};

exports.copyfile = function (f1, f2) {
    var old = fs.createReadStream(f1),
        neu = fs.createWriteStream(f2);

    neu.once('open', function (fd) {
        require('util').pump(old, neu);
    });
};

exports.copydir = function (d1, d2) {
    exports.walk(d1,
        function (file) {
            var neu = path.join(path.dirname(file).replace(d1, d2), path.basename(file));
            //console.log("copy file from " + file + " to " + neu);
            exports.copyfile(file, neu);
        },
        function (dir) {
            var neu = dir.replace(d1, d2);
            //console.log("make directory: " + neu);
            exports.mkdir(neu);
        },
        function (err) {
            if (err) {
                throw err;
            }
            //console.log("finished.");
        }
    );
};

