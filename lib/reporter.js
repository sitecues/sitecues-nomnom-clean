'use strict';

const constants = require('./constants');

function getReportModules(reports) {
  const reportModules = {};
  reports.forEach(report => reportModules[report] = require('./reports/' + report));
  return reportModules;
}

function run(options) {

  const configFinalizer = require('./config-finalizer.js'),
    config = configFinalizer(options),
    reportModules = getReportModules(config.reports);
}

module.exports = run;

