'use strict';

function generateReportView(config, report) {
  let text = '<!DOCTYPE html><html><body>';

  report.forEach(entry => {
    text += entry.url + '\n';
    Object.keys(entry.reports).forEach(reportName => {
      text += '  ' + entry.reports[reportName] + '\n';
    });
    text += '\n';
  });

  text += '</body></html>';

  return text;
}

module.exports = generateReportView;
