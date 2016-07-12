'use strict';

// TODO multithreaded
// TODO Export to csv
// TODO Track in JS database? This will allow us to do the collating etc. with queries, and not recompute the data every time
// TODO Collating by versions, sessions, users, time periods, site ids

const fs = require('fs'),
 zlib = require('zlib'),
 es = require('event-stream');

let config,
  eventCounter = 0;

function getReportModules(reports) {
  return reports.map((report) => {
    const reportModule = require('./reports/' + report);
    reportModule.init(config);
    return reportModule;
  });
}

function run(options) {

  function processLogFile(logFileName, index) {
    return new Promise((resolve, reject) => {

      const pathName = logFileName,
        gunzip = zlib.createGunzip();

      fs.createReadStream(pathName)
        .pipe(gunzip)
        .pipe(es.split())
        .pipe(es.map((event, callback) => {
          if (event) {
            if (++ eventCounter % config.eventStep === 0) {
              const parsedEvent = JSON.parse(event),
                clientData = parsedEvent.clientData;  // Other data doesn't seem helpful
              if (typeof clientData !== 'object') {
                console.error('Error, illegal clientData in ' + logFileName + ':\n' + JSON.stringify(parsedEvent));
              }
              else if (!config.siteId || clientData.siteId == config.siteId) {
                clientData.added = {}; // Placeholder for additional information we add lazily
                reportModules.forEach((reportModule) => reportModule.onData(index, clientData));
              }
            }
          }
          callback();
        }))
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
          report = require('./views/' + config.view)(config, reportData.result);

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

