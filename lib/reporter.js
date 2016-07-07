'use strict';

const constants = require('./constants'),
 fs = require('fs'),
 zlib = require('zlib'),
 path = require('path'),
 JSONStream = require('JSONStream'),
 es = require('event-stream');

function getReportModules(reports) {
  return reports.map((report) => require('./reports/' + report));
}

function run(options) {

  function processData(eventLogIndex, data) {
    const lines = data ? data.toString().split('\n') : [ ];
    let numLines = lines.length;

    // We will cache leftover data from half-complete lines here
    if (!processData.leftOverData) {
      processData.leftOverData = [];
    }

    // Use previously leftover data (the last line from the previous call)
    if (processData.leftOverData[eventLogIndex]) {
      lines[0] = processData.leftOverData[eventLogIndex] + lines[0];
      processData.leftOverData[eventLogIndex] = '';
    }

    // Store last line as leftover data for use next time
    if (data) {
      processData.leftOverData[eventLogIndex] = lines[numLines - 1];
      -- numLines;
    }

    for (let lineNum = 0; lineNum < numLines; lineNum ++ ) {
      const line = lines[lineNum],
        parsedEvent = JSON.parse(line);
      reportModules.forEach((reportModule) => reportModule.onData(eventLogIndex, parsedEvent));
    }
  }

  function processError(logFileName, err) {
    throw new Error('Error reading ' + logFileName + ':\n' + err);
  }

  function processLogFile(logFileName, index) {
    return new Promise((resolve, reject) => {

      const pathName = logFileName, //path.join(constants.DEFAULT_DATA_FOLDER, logFileName),
        gunzip = zlib.createGunzip();

      fs.createReadStream(pathName)
        .pipe(gunzip)
        .pipe(es.split())
        .pipe(es.parse({error: true}))
        .pipe(es.map((parsedEvent, callback) => {
          reportModules.forEach((reportModule) => reportModule.onData(index, parsedEvent));
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

