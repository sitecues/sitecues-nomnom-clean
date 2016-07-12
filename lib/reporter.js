'use strict';

// TODO multithreaded
// TODO Track in JS database? This will allow us to do the collating etc. with queries, and not recompute the data every time
// TODO Collating by versions, sessions, users, time periods, site ids (client side)
// TODO Needs to be able to handle multiple requests

const fs = require('fs'),
 zlib = require('zlib'),
 es = require('event-stream');

let config,
  eventCounter = [],
  numFilesCompleted = 0,
  logger;

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
            eventCounter[index] = (eventCounter[index] || 0) + 1;
            if (eventCounter[index] % config.eventStep === 0 &&
              (!config.keepTopEvents || eventCounter[index] <= config.keepTopEvents)) {
              const parsedEvent = JSON.parse(event),
                clientData = parsedEvent.clientData;  // Other data doesn't seem helpful
              if (typeof clientData !== 'object') {
                console.error('Error, illegal clientData in ' + logFileName + ':\n' + JSON.stringify(parsedEvent));
              }
              else if (!config.siteId || clientData.siteId === config.siteId) {
                clientData.added = {}; // Placeholder for additional information we add lazily
                reportModules.forEach((reportModule) => reportModule.onData(index, clientData));
              }
            }
          }
          callback();
        }))
        .on('end', () => {
          ++ numFilesCompleted;
          const percentCompleted = (100 * numFilesCompleted / config.logFileNames.length).toFixed(1);
          logger('Completed #%d [%d\% completed]: %s', index, percentCompleted, logFileName); resolve();
        });
    });
  }

  config = require('./config')(options);

  const
    logFileNames = config.logFileNames,
    reportModules = getReportModules(config.reports),
    allReportsReady = logFileNames.map(processLogFile),
    logger = config.doLogDebugInfo ? console.log : function() {};

  logger('Begin processing ...');

  return Promise.all(allReportsReady)
    .then(() => {
      logger('Processing complete ...');

      const results = {};
      reportModules.forEach((reportModule, index) => {
        const reportData = reportModule.finalize(),
          name = config.reports[index],
          report = reportData;

        results[name] = report;
      });
      return results;
    });
}

module.exports = run;

