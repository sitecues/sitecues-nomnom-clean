'use strict';

// TODO multithreaded
// TODO Classes for different event types?
// TODO Track in JS database?

const fs = require('fs'),
 zlib = require('zlib'),
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
            const parsedEvent = JSON.parse(event).clientData;  // Other data doesn't seem helpful
            parsedEvent.added = {}; // Placeholder for additional information we add lazily
            reportModules.forEach((reportModule) => reportModule.onData(index, parsedEvent));
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
      return reportModules.map((reportModule) => {
        const reportData = reportModule.finalize(),
          name = reportData.name,
          report = require('./views/' + config.view)(config, reportData);

        return {
          name,
          report
        }
      });
    });
}

module.exports = run;

