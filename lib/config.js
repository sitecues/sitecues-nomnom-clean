// Run bin/nomnom-cli to see options

'use strict';

const constants = require('./constants'),
  globFs = require('glob-fs'),
  DEFAULT_VIEW = 'json';

function getReports(reports) {
  if (reports) {
    return reports.split(',');
  }
}

function getFileIndex(files, substring, defaultValue) {
  function matchesDate(fileName) {
    return fileName.includes(substring);
  }

  const index = files.findIndex(matchesDate);
  return index >= 0 ? index : defaultValue;
}

function getLogFileNames(startDate, endDate, dayStep) {
  const glob = globFs({ gitignore: true}),
    files = glob.readdirSync(constants.DEFAULT_DATA_FOLDER + '*.log.gz');

  var startIndex = getFileIndex(files, '-' + startDate, 0), 
    endIndex = getFileIndex(files, '-' + endDate, files.length);

  return files.slice(startIndex,  endIndex + 1)
    .filter((value, index) => index % dayStep === 0);
}

function getAllReports() {
  // Use all reports (contents of reports/*.js)
  const glob = globFs({ gitignore: true}),
    files = glob.readdirSync('lib/reports/*.js');

  return files ? files.map(fileName => fileName.split('reports/')[1].split('.js')[0]) : [];
}

function init(options) {
  const reports = getReports(options.reports) || getAllReports(),
    logFileNames = getLogFileNames(options.startDate, options.endDate, options.dayStep || 1);

  return {
    reports,
    logFileNames,
    numDates:logFileNames.length,
    eventStep: options.eventStep || 1,
    siteId: options.siteId,
    view: options.view || DEFAULT_VIEW
  };
}

module.exports = init;
