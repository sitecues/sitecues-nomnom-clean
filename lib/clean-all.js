'use strict';

// TODO app-start and page-load events came from where?
// TODO page-visited -- hardly any events
const fs = require('fs'),
  zlib = require('zlib'),
  es = require('event-stream'),
  path = require('path'),
  constants = require('./constants'),
  fetchMissingData = require('./fetch-missing-data'),
  repairEvent = require('./repair/repair'),
  eventCounter = [],
  rejectedEventCounter = [];

let config,
  numFilesCompleted = 0,
  logger;

function isCleanDataValid(filePath) {
  if (config.doForce) {
    return false;
  }

  try {
    fs.accessSync(filePath);
    return true;
  }
  catch(ex) {
    return false;
  }
}

function findRawFile(fileName, filePath) {
  try {
    fs.accessSync(filePath);
    return Promise.resolve();
  }
  catch(ex) {
    logger('Attempting to fetch missing data %s', fileName);
    return fetchMissingData(fileName, filePath)
      .then(() => {
        logger('Successfully downloaded ' + fileName);
        return Promise.resolve();
      })
      .catch((err) => {
        return Promise.reject(new Error('Failed to download ' + fileName +': ' + err));
      });
  }
}

function toTenths(num) {
  return Math.round(1000 * num) / 10;
}

// Writes to a tmp file first so that partially completed zip files are not left laying around
// TODO option to use process.stdin and process.stdout
function repairLogFile(logFileName, rawDataPath, cleanDataPath, dateIndex) {
  return new Promise((resolve) => {

    logger('Begin cleaning ' + logFileName);

    const
      tmpDataPath = cleanDataPath + '.tmp.gz';

    // Remove old file if it exists
    try {
      fs.unlinkSync(cleanDataPath);
    }
    catch(ex) {
    }

    const
      gzip = zlib.createGzip(),
      input = fs.createReadStream(rawDataPath)
          .pipe(zlib.createGunzip()),
      output = fs.createWriteStream(tmpDataPath);

    input
      .pipe(es.split())
      .pipe(es.map((event, callback) => {
        if (event) {
          eventCounter[dateIndex] = (eventCounter[dateIndex] || 0) + 1;
          const allEventData = JSON.parse(event),
            clientData = allEventData.clientData,  // Other data doesn't seem helpful, except for original siteId
            backupSiteId = allEventData.siteKey;
          if (!clientData) {
            logger('Error, illegal clientData at ' + logFileName + ':%d:\n%s', eventCounter[dateIndex], event);
          }
          else if (repairEvent(clientData, backupSiteId, allEventData.serverTimeTs)) {
            callback(null, clientData);
            return;
          }
        }
        rejectedEventCounter[dateIndex] = (rejectedEventCounter[dateIndex] || 0) + 1;
        callback();
      }))
      .pipe(es.stringify())
      .pipe(gzip)
      .pipe(output)
      .on('finish', () => {
        ++ numFilesCompleted;
        const percentCompleted = (100 * numFilesCompleted / config.numDates).toFixed(1),
          rejectedEventsInfo = toTenths(rejectedEventCounter[dateIndex] / eventCounter[dateIndex]) + '% rejected';
        logger('Completed #%d [%d\% completed]: %s        ' + rejectedEventsInfo + '      Heap=%dk', dateIndex, percentCompleted, logFileName, Math.round(process.memoryUsage().heapUsed/1000));
        fs.rename(tmpDataPath, cleanDataPath, resolve);
      });
  });
}

// Go through in reverse so that we can draw from better domain to siteId map when fixing missing site ids
function cleanAll(logFileNames) {
  var MAX_POOLSIZE = 10,
    numLogFiles = logFileNames.length,
    poolSize = Math.min(numLogFiles, MAX_POOLSIZE),
    nextUp = logFileNames.length;

  return new Promise((resolve) => {
    function addToQueue() {
      if (-- nextUp >= 0) {
        // Add another to queue
        const logFileName = logFileNames[nextUp],
          rawDataPath = path.join(config.rawDataFolder, logFileName),
          cleanDataPath = path.join(config.cleanDataFolder, logFileName),
          nowUp = nextUp;

        if (isCleanDataValid(cleanDataPath)) {
          // Already have valid data
          logger('Found valid data for ' + logFileName);
          addToQueue();
        }
        else {
          // Need to clean this log file
          findRawFile(logFileName, rawDataPath)
            .then(() => repairLogFile(logFileName, rawDataPath, cleanDataPath, nowUp))
            .catch((err) => {
              console.error(err);
            })
            .then(addToQueue);
        }
      }
      // Finished but didn't add ... poolSize decreases
      else {
        if (-- poolSize === 0) {
          // None left in pool, we are finished
          resolve();
        }
      }
    }

    // Init queue with poolSize jobs
    for (let count = 0; count < poolSize; count ++) {
      addToQueue();
    }
  });
}

function mkdir(dir) {
  try {
    fs.mkdirSync(dir); // Ensure data directory created
  }
  catch(ex) {
    // Directories already available
  }
}

function makeDataFolders() {
  // Ensure data directories created
  mkdir(config.dataFolder);
  mkdir(config.rawDataFolder);
  mkdir(config.cleanDataFolder);
}

function deleteTempFiles() {
  try {
    logger('Deleting temporary files ... ');
    const pattern = path.join(config.cleanDataFolder, '*.tmp.gz');
    require('child_process')
      .execSync('rm ' + pattern);
  }
  catch(ex) {
  }
}

function run(options) {

  config = require('./config')(options);

  logger = config.quiet ? function() {} : console.log;

  logger(JSON.stringify(config, null, 2));

  makeDataFolders();

  deleteTempFiles();

  const
    logFileNames = config.logFileNames;

  logger('Begin cleaning ...');

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

  return cleanAll(logFileNames)
    .then(() => {
      logger('Cleaning complete ...');
    });
}

module.exports = run;

