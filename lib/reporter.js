'use strict';

// TODO multithreaded
// TODO Classes for different event types?
// TODO Track in JS database?

const fs = require('fs'),
 zlib = require('zlib'),
 es = require('event-stream');

let config;

function getReportModules(reports) {
  return reports.map((report) => {
    const reportModule = require('./reports/' + report);
    reportModule.init(config);
    return reportModule;
  });
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
            const parsedEvent = JSON.parse(event),
              clientData = parsedEvent.clientData;  // Other data doesn't seem helpful
            if (typeof clientData !== 'object') {
              console.error('Error, illegal clientData:\n' + JSON.stringify(parsedEvent));
            }
            else {
              clientData.added = {}; // Placeholder for additional information we add lazily
              reportModules.forEach((reportModule) => reportModule.onData(index, clientData));
            }
          }
          callback();
        }))
        .on('error', (err) => processError(logFileName, err))
        .on('end', () => { /* console.log('Completed #%d: %s', index, logFileName); */ resolve(); } );
    });
  }

  config = require('./config')(options);

  const
    logFileNames = config.logFileNames,
    reportModules = getReportModules(config.reports),
    allReportsReady = logFileNames.map(processLogFile);

  return Promise.all(allReportsReady)
    .then(() => {
      const views = reportModules.map((reportModule) => {
        const reportData = reportModule.finalize(),
          name = reportData.name,
          report = require('./views/' + config.view)(config, reportData);

        return {
          name,
          report
        }
      });
      return {
        config,
        views
      };
    });
}

module.exports = run;

