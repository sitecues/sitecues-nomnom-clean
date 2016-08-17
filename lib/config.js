// Run bin/nomnom-clean-cli to see options

'use strict';

const constants = require('./constants'),
  path = require('path');

function getLogFileNames(datesArray) {
  return datesArray.map((dateVal) => 'metrics-' + dateVal + '.log.gz');
}

// dateVal is a number like 20160212
function getDateAsString(dateVal) {
  if (dateVal) {
    var dateAsYYYYMMDD = dateVal.toString(),
      year = dateAsYYYYMMDD.substr(2, 2),
      month = dateAsYYYYMMDD.substr(4, 2),
      day = dateAsYYYYMMDD.substr(6, 2);

    return month + '/' + day + '/' + year;
  }
}

// date is a Date object
function getDateAsNumber(date) {
  var year = date.getFullYear(),
    month = date.getMonth() + 1, // getMonth() is zero-based
    day = date.getDate(),
    asString = '' + year + (month > 9 ? '': 0) + month + (day > 9 ? '': 0) + day;
  return parseInt(asString);
}

function getYesterday() {
  var date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
}

function getDatesArray(startDate, endDate, dayStep) {
  var start = new Date(getDateAsString(startDate || constants.BEGINNING_OF_TIME)),
    end = endDate ? new Date(getDateAsString(endDate)) : getYesterday(),
    curr = start,
    result = [];

  while (true) {
    if (curr > end) {
      break;
    }
    result.push(getDateAsNumber(curr));
    curr.setDate(curr.getDate() + dayStep);
  }

  return result;
}

function init(options) {
  function toDateIndex(dateOrFileName) {
    if (dateOrFileName) {
      var datePortion = dateOrFileName.match(/\d{8}/);
      return datePortion && parseInt(datePortion[0]);
    }
  }

  const dataFolder = options.dataFolder || constants.DEFAULT_DATA_FOLDER,
    dates = getDatesArray(toDateIndex(options.start), toDateIndex(options.end), 1),
    logFileNames = getLogFileNames(dates);

  return {
    dataFolder,
    rawDataFolder: path.join(dataFolder, constants.RAW_DATA_SUBFOLDER),
    cleanDataFolder: path.join(dataFolder, constants.CLEAN_DATA_SUBFOLDER),
    logFileNames,
    dates,
    doForce: options.doForce,
    numDates: logFileNames.length,
    keepTopEvents: options.keepTopEvents,
    doLogDebugInfo : options.doLogDebugInfo
  };
}

module.exports = init;
