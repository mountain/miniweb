var fs = require("fs"),
    path = require("path");


/**
 *  Asynchronous directory traversal in node.js
 *  Original by stygstra
 *  Modified by mountain
 *  https://gist.github.com/514983
 */
exports.prewalk = (function() {
    var counter = 0;
    var prewalk = function (dirname, fcallback, dcallback, finished) {
        counter += 1;
        fs.readdir(dirname, function (err, relnames) {
            if (err) {
                if (finished) {
                    finished(err);
                }
                return;
            }

            if (relnames.length === 0) {
                if (finished) {
                    finished(null);
                }
                return;
            }

            relnames.forEach(function (relname, index, relnames) {
                var name = path.join(dirname, relname);
                counter += 1;
                fs.stat(name, function (err, stat) {
                    if (err) {
                        finished(err);
                        return;
                    }
                    if (stat.isDirectory()) {
                        if (dcallback) {
                            dcallback(name);
                        }
                        exports.prewalk(name, fcallback, dcallback, finished);
                    } else {
                        if (fcallback) {
                            fcallback(name);
                        }
                    }
                    counter -= 1;
                    if (index === relnames.length - 1) {
                        counter -= 1;
                    }
                    if (counter === 0) {
                        if (finished) {
                            finished(null);
                        }
                    }
                });
            });
        });
    };
    return prewalk;
})();

/**
 *  Asynchronous directory traversal in node.js
 *  Original by stygstra
 *  Modified by mountain
 *  https://gist.github.com/514983
 */
exports.postwalk = (function() {
    var counter = 0;
    var postwalk = function (dirname, fcallback, dcallback, finished) {
        counter += 1;
        //console.log("check path: " + dirname);
        fs.readdir(dirname, function (err, relnames) {
            if (err) {
                if (finished) {
                    finished(err);
                }
                return;
            }

            if (relnames.length === 0) {
                if (finished) {
                    finished(null);
                }
                return;
            }

            relnames.forEach(function (relname, index, relnames) {
                var name = path.join(dirname, relname);
                //console.log("check path: " + name);
                counter += 1;
                fs.stat(name, function (err, stat) {
                    if (err) {
                        if (finished) {
                            finished(err);
                        }
                        return;
                    }
                    if (stat.isDirectory()) {
                        exports.postwalk(name, fcallback, dcallback, finished);
                        if (dcallback) {
                            dcallback(name);
                        }
                    } else {
                        if (fcallback) {
                            fcallback(name);
                        }
                    }
                    counter -= 1;
                    if (index === relnames.length - 1) {
                        counter -= 1;
                    }
                    //console.log("counter= " + counter);
                    if(counter === 0) {
                        if (finished) {
                            finished(null);
                        }
                    }
                });
            });
        });
    };
    return postwalk;
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

exports.copydir = function (d1, d2, callback) {
    exports.prewalk(d1,
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
            if (callback) {
                callback();
            }
            //console.log("finished.");
        }
    );
};

