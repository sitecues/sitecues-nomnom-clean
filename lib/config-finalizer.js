// Run bin/nomnom-cli to see options

'use strict';

const constants = require('./constants');

function getChecks(checks) {
  if (checks) {
    return checks.split(',');
  }
}

function getAllChecks() {
  // Use all checks (contents of checks/*.js)
  const glob = require('glob-fs')({ gitignore: true }),
    files = glob.readdirSync('lib/checks/*.js');

  return files ? files.map(fileName => fileName.split('checks/')[1].split('.js')[0]) : [];
}

function finalizeConfig(options) {
  const 
    DEFAULT_VIEW = 'text',
    config = {
      checks: getChecks(options.checks) || getAllChecks()  ,
      view: options.view || DEFAULT_VIEW
    };
  console.log('\nConfiguration:\n', config, '\n');
  return config;
}

module.exports = finalizeConfig;
