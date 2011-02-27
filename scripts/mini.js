#!/usr/bin/env node

var _   = require('underscore'),
    sys = require('sys'),
    fs  = require('fs'),
    cmd = require('../lib/simplecmd');

var settingfile = process.cwd() + '/module.json',
    subcmd = process.argv[2];

if (!subcmd) {
    sys.puts('no command found');
    process.exit(1);
}

if (subcmd === 'create') {
    try {
        var args = _.rest(process.argv, 3);
        require('./create').apply(undefined, args);
    } catch (err2) {
        sys.puts('Error when handling create command: ' + err2);
        process.exit(1);
    }
    return;
}

var mapping = {
    module: {
        list: require('./module/list'),
        add: require('./module/add'),
        remove: require('./module/remove')
    }
};

fs.readFile(settingfile, function(err, data) {
    var settings = undefined;

    if (err) {
        sys.puts('No module.json file found ('+err+').');
        process.exit(1);
    } else {
        try {
            settings = JSON.parse(data.toString('utf8', 0, data.length));
        } catch (err1) {
            sys.puts('Error when parsing settings: ' + err1);
            process.exit(1);
        }
        try {
            cmd.handle(settings, mapping, _.rest(process.argv, 3));
        } catch (err2) {
            sys.puts('Error when handling command: ' + err2);
            process.exit(1);
        }
    }
});

