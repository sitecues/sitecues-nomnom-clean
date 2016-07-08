'use strict';

const constants = require('./constants'),
 fs = require('fs'),
 zlib = require('zlib'),
 path = require('path'),
 es = require('event-stream');

function getReportModules(reports) {
  return reports.map((report) => require('./reports/' + report));
}

function run(options) {

  function processError(logFileName, err) {
    throw new Error('Error reading ' + logFileName + ':\n' + err);
  }

  function processLogFile(logFileName, index) {
    return new Promise((resolve, reject) => {

      const pathName = logFileName,
        gunzip = zlib.createGunzip();

      fs.createReadStream(pathName)
        .pipe(gunzip)
        .pipe(es.split())
        .pipe(es.map((event, callback) => {
          if (event) {
            reportModules.forEach((reportModule) => reportModule.onData(index, JSON.parse(event)));
          }
          callback();
        }))
        .on('error', (err) => processError(logFileName, err))
        .on('end', () => { console.log('Completed #%d: %s', index, logFileName); resolve(); } ); 
    });
  }

  const configFinalizer = require('./config-finalizer.js'),
    config = configFinalizer(options),
    logFileNames = config.logFileNames,
    reportModules = getReportModules(config.reports),
    allReportsReady = logFileNames.map(processLogFile);

  return Promise.all(allReportsReady)
    .then(() => {
      return reportModules.map((reportModule) => reportModule.finalize());
    });
}

module.exports = run;

