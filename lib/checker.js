'use strict';

const constants = require('./constants');

function getCheckModules(checks) {
  const checkModules = {};
  checks.forEach(check => checkModules[check] = require('./checks/' + check));
  return checkModules;
}

function run(options) {

  const configFinalizer = require('./config-finalizer.js'),
    config = configFinalizer(options),
    checkModules = getCheckModules(config.checks);
}

module.exports = run;

