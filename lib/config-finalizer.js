// Run bin/nomnom-cli to see options

'use strict';

const constants = require('./constants');

function getReports(reports) {
  if (reports) {
    return reports.split(',');
  }
}

function getAllReports() {
  // Use all reports (contents of reports/*.js)
  const glob = require('glob-fs')({ gitignore: true }),
    files = glob.readdirSync('lib/reports/*.js');

  return files ? files.map(fileName => fileName.split('reports/')[1].split('.js')[0]) : [];
}

function finalizeConfig(options) {
  const 
    DEFAULT_VIEW = 'text',
    config = {
      reports: getReports(options.reports) || getAllReports()  ,
      view: options.view || DEFAULT_VIEW
    };
  console.log('\nConfiguration:\n', config, '\n');
  return config;
}

module.exports = finalizeConfig;
