'use strict';

function generateTextReport(config, report) {
  let text = '';

  report.forEach(entry => {
    text += entry.url + '\n';
    Object.keys(entry.checks).forEach(checkName => {
      text += '  ' + entry.checks[checkName] + '\n';
    });
    text += '\n';
  });

  return text;
}

module.exports = generateTextReport;
