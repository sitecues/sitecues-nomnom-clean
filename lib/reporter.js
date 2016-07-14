'use strict';

// TODO multithreaded
// TODO Track in JS database? This will allow us to do the collating etc. with queries, and not recompute the data every time
// TODO Collating by versions, sessions, users, time periods, site ids (client side)
// TODO Needs to be able to handle multiple requests

const fs = require('fs'),
  zlib = require('zlib'),
  es = require('event-stream'),
  path = require('path'),
  constants = require('./constants'),
  fixParsedEvent = require('event-fixer');

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

function processLogFileIfExists(logFileName, index, reportModules) {
  const logPath = path.join(constants.DEFAULT_DATA_FOLDER, logFileName);

  try {
    fs.accessSync(logPath);
    return processLogFile(logFileName, logPath, index, reportModules);
  }
  catch(ex) {
    console.error('*** Could not read %s', logFileName);
    return Promise.resolve();
  }
}

function processLogFile(logFileName, logPath, index, reportModules) {
  return new Promise((resolve) => {

    logger('Begin processing ' + logFileName);

    fs.createReadStream(logPath)
      .pipe(zlib.createGunzip())
      .pipe(es.split())
      .pipe(es.map((event, callback) => {
        if (event) {
          eventCounter[index] = (eventCounter[index] || 0) + 1;
          if (eventCounter[index] % config.eventStep === 0 &&
            (!config.keepTopEvents || eventCounter[index] <= config.keepTopEvents)) {
            const parsedEvent = fixParsedEvent(JSON.parse(event)),
              clientData = parsedEvent.clientData;  // Other data doesn't seem helpful
            if (typeof clientData !== 'object') {
              console.error('Error, illegal clientData at ' + logFileName + ':%d:\n%s', eventCounter[index], JSON.stringify(parsedEvent));
            }
          }
        }
        callback();
      }))
      .on('end', () => {
        ++ numFilesCompleted;
        const percentCompleted = (100 * numFilesCompleted / config.logFileNames.length).toFixed(1);
        logger('Completed #%d [%d\% completed]: %s        Heap=%dk', index, percentCompleted, logFileName, Math.round(process.memoryUsage().heapUsed/1000));
        resolve();
      })
  });
}

function finishAllReports(logFileNames, reportModules) {
  var MAX_POOLSIZE = 10,
    numLogFiles = logFileNames.length,
    poolSize = Math.min(numLogFiles, MAX_POOLSIZE),
    nextUp = 0;

  return new Promise((resolve) => {
    function addToQueue() {
      if (nextUp < numLogFiles) {
        // Add another to queue
        processLogFileIfExists(logFileNames[nextUp], nextUp, reportModules)
          .then(addToQueue);
        ++ nextUp;
      }
      // Finished but didn't add ... poolSize decreases
      else if (-- poolSize === 0) {
        // None left in pool, we are finished
        resolve();
      }
    }
    while (nextUp < poolSize) {
      addToQueue();
    }
  });
}

function run(options) {

  config = require('./config')(options);

  console.log(config);

  const
    logFileNames = config.logFileNames,
    reportModules = getReportModules(config.reports);

  logger = config.doLogDebugInfo ? console.log : function() {};
  logger('Begin processing ...');

  // ********* Memory leak debugging **********
  // const memwatch = require('memwatch-next'),
  //   heapdump = require('heapdump');
  // memwatch.on('leak', (info) => {
  //   logger('Leak: ' +JSON.stringify(info, null, 2));
  //   var file = '/code/alewife/nomnom-' + process.pid + '-' + Date.now() + '.heapsnapshot';
  //   heapdump.writeSnapshot(file, function(err){
  //     if (err) console.error(err);
  //     else console.error('Wrote snapshot: ' + file);
  //   });
  // });
  // *******************************************

  return finishAllReports(logFileNames, reportModules)
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

