#!/usr/bin/env node

var path = require("fs").realpathSync(__dirname + "/.."),
    //Minimal = require("../../minimal"),
    Minimal = require("minimal"),
    server = Minimal.server,
    logger = Minimal.logger;

logger.info("start minimal at " + path);

server.start(path);
