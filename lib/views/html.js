'use strict';

function generateTextReport(config, report) {
  let text = '<!DOCTYPE html><html><body>';

  report.forEach(entry => {
    text += entry.url + '\n';
    Object.keys(entry.checks).forEach(checkName => {
      text += '  ' + entry.checks[checkName] + '\n';
    });
    text += '\n';
  });

  text += '</body></html>';

  return text;
}

module.exports = generateTextReport;
