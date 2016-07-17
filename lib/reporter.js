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
  fixParsedEvent = require('./event-fixer');

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
  }
  catch(ex) {
    console.error('*** Could not read %s', logFileName);
    return Promise.resolve();
  }

  return processLogFile(logFileName, logPath, index, reportModules);
}

// Don't parse the outer part of the event -- we only care about the clientData field
function getClientData(eventStr) {
  const CLIENT_DATA_PREFIX = '\"clientData\":{',
    startClientData = eventStr.indexOf(CLIENT_DATA_PREFIX);
  if (startClientData >= 0) {
    const clientDataPart = eventStr.substring(startClientData + CLIENT_DATA_PREFIX.length - 1, eventStr.length - 1);
    return JSON.parse(clientDataPart);
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
            const clientData = getClientData(event);  // Other data doesn't seem helpful
            if (!clientData) {
              console.error('Error, illegal clientData at ' + logFileName + ':%d:\n%s', eventCounter[index], event);
            }
            else {
              fixParsedEvent(clientData); // Correct mistakes introduced in various versions of Sitecues
              // Just skip these for now -- they are filling up the list of urls too much
              // Maybe we should track the events but not the urls -- make the location a static string
              if (!clientData.doIgnore) {
                clientData.metadata = {}; // Room for our added meta data (see metadata/)
                reportModules.forEach((reportModule) => reportModule.onData(index, clientData));
              }
            }
          }
        }
        callback();
      }))
      .on('end', () => {
        ++ numFilesCompleted;
        const percentCompleted = (100 * numFilesCompleted / config.numDates).toFixed(1);
        logger('Completed #%d [%d\% completed]: %s        Heap=%dk', index, percentCompleted, logFileName, Math.round(process.memoryUsage().heapUsed/1000));
        resolve();
      })
  });
}

function finishAllReports(logFileNames, reportModules) {
  var MAX_POOLSIZE = 15,
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

      logger(results.summary.timing);
      return results;
    });
}

module.exports = run;

