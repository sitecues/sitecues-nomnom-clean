'use strict';

function generateTextReport(config, report) {
  let text = '';

  report.forEach(entry => {
    text += entry.url + '\n';
    Object.keys(entry.reports).forEach(reportName => {
      text += '  ' + entry.reports[reportName] + '\n';
    });
    text += '\n';
  });

  return text;
}

module.exports = generateTextReport;
