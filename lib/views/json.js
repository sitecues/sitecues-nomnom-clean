'use strict';

function generateTextReport(config, report) {
  return JSON.stringify(report, null, 2);
}

module.exports = generateTextReport;
