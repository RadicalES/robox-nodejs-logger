#!/usr/bin/env node
/* (C) 2020 Radical Electronic Systems CC */

// importing setup
const Config = require("./config.json");
// logger
const logger = require('./robox/logger');
// importing Server class
const RoboXServer = require('./robox/roboxserver');

const server = new RoboXServer(Config.server.ipAddress, Config.server.port, Config.devices);
// Starting our server
server.start(() => {
  logger.info('RoboX Logger Running');
});

