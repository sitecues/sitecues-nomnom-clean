'use strict';

function generateReportView(config, report) {
  return JSON.stringify(report, null, 2);
}

module.exports = generateReportView;
