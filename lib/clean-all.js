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
      gzip = zlib.createGzip(),
      input = fs.createReadStream(rawDataPath)
          .pipe(zlib.createGunzip()),
      output = fs.createWriteStream(cleanDataPath);

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
          else if (repairEvent(clientData, backupSiteId, allEventData.serverTs, allEventData.eventId, dateIndex)) {
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
        resolve({ dateIndex, logFileName });
      });
  });
}

// Go through in reverse so that we can draw from better domain to siteId map when fixing missing site ids
function cleanAll(logFileNames) {
  var MAX_POOLSIZE = 6,
    numLogFiles = logFileNames.length,
    poolSize = Math.min(numLogFiles, MAX_POOLSIZE),
    nextUp = logFileNames.length;

  return new Promise((resolve) => {
    function addToQueue(completionInfo) {
      if (completionInfo) {
        ++ numFilesCompleted;
        const percentCompleted = (100 * numFilesCompleted / config.numDates).toFixed(1),
          rejectedEventsInfo = toTenths(rejectedEventCounter[completionInfo.dateIndex] / eventCounter[completionInfo.dateIndex]) + '% rejected',
          percentCompletionInfo = '[' + percentCompleted + '\% completed]';
        if (completionInfo.err) {
          console.log('Error fetching data file %s: ', percentCompletionInfo, completionInfo.logFileName);
          console.error(completionInfo.err);
        }
        else if (completionInfo.didFindValidData) {
          logger('Found valid data for #%d %s: ', completionInfo.dateIndex, percentCompletionInfo, completionInfo.logFileName);
        }
        else {
          logger('Completed #%d %s: %s        %s      Heap=%dk', completionInfo.dateIndex, percentCompletionInfo,
            completionInfo.logFileName, rejectedEventsInfo, Math.round(process.memoryUsage().heapUsed / 1000));
        }
      }

      if (-- nextUp >= 0) {
        // Add another to queue
        const logFileName = logFileNames[nextUp],
          rawDataPath = path.join(config.rawDataFolder, logFileName),
          workingCleanDataPath = path.join(config.workingCleanDataFolder, logFileName),
          finalCleanDataPath = path.join(config.finalCleanDataFolder, logFileName),
          nowUp = nextUp;

        if (isCleanDataValid(finalCleanDataPath)) {
          // Already have valid data
          const completionInfo = { didFindValidData: true, dateIndex: nextUp, logFileName };
          setTimeout(function() {
            addToQueue(completionInfo);
          }, 0);
        }
        else {
          // Need to clean this log file
          findRawFile(logFileName, rawDataPath)
            .then(() => repairLogFile(logFileName, rawDataPath, workingCleanDataPath, nowUp))
            .catch((err) => {
              return { err, logFileName, dateIndex: nextUp };
            })
            .then(addToQueue);
        }
      }
      // Finished but didn't add ... poolSize decreases
      else {
        -- poolSize;
        if (poolSize === 0) {
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
  mkdir(config.workingCleanDataFolder);
  mkdir(config.finalCleanDataFolder);
}

function clearWorkingFolder() {
  try {
    logger('Deleting temporary working files ... ');
    const pattern = path.join(config.workingCleanDataFolder, '*');
    require('child_process')
      .execSync('rm ' + pattern, { stdio: 'ignore', stderr: 'ignore' });
  }
  catch(ex) {
  }
}

function copyWorkingDataToFinalLocation() {
  try {
    logger('Copying working files to final location ... ');
    const sourcePattern = path.join(config.workingCleanDataFolder, '*');
    require('child_process')
      .execSync('mv -f ' + sourcePattern + ' ' + config.finalCleanDataFolder);
  }
  catch(ex) {
  }
}

// When working.txt is present the cleaning system is busy
function getWorkingTxtPath() {
  return path.join(config.finalCleanDataFolder, 'working.txt');
}

function createWorkingTxtLock() {
  try {
    fs.writeFile(getWorkingTxtPath(), 'busy');
  }
  catch(ex) {
  }
}

function removeWorkingTxtLock() {
  try {
    fs.unlink(getWorkingTxtPath());
  }
  catch(ex) {
  }
}

function waitForWorkingTxtLock() {
  return new Promise((resolve) => {
    const filePath = getWorkingTxtPath();
    let count = 0;
    const interval = setInterval(function () {
      try {
        fs.accessSync(filePath);
        if (!config.quiet) {
          ++count;
          process.stdout.write(count === 1 ? 'Waiting for lock.' : '.');
        }
      }
      catch (ex) {
        logger(''); // New line
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
}

function logConfig(config) {
  function replacer(key, value) {
    // Filtering out properties
    if (Array.isArray(value)) {
      return undefined;
    }
    return value;
  }

  logger(JSON.stringify(config, replacer, 2));
}

function run(options) {

  config = require('./config')(options);

  logger = config.quiet ? function () {} : console.log;

  logConfig(config);

  makeDataFolders();

  // If forcing new data, clear it now so that we can see what was deleted
  // Otherwise, only clear the temp files
  clearWorkingFolder();

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
    .then(waitForWorkingTxtLock)
    .then(() => {
      createWorkingTxtLock();
      copyWorkingDataToFinalLocation();
      removeWorkingTxtLock();
      logger('Cleaning complete ...');
    });
}

module.exports = run;

