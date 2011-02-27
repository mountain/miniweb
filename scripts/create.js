var sys  = require('sys'),
    fs   = require('fs'),
    path = require('path'),
    fsutil = require('../lib/fsutil');

module.exports = function (proj) {
    if (!proj) {
        sys.puts('No project name found.');
        process.exit(1);
    }
    sys.puts('create project ' + proj);
    var p = path.join(process.cwd(), proj);
    path.exists(p, function (exists) {
        if (exists) {
            sys.puts('error: path ' + p + ' already exists');
        } else {
            fsutil.mkdir(p);
            fsutil.copydir(path.join(__dirname, '..', 'prototype'), p);
        }
    });
};
