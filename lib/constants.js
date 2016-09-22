'use strict';

const os = require('os'),
  path = require('path');

module.exports = {
  DEFAULT_DATA_FOLDER: path.join(os.homedir(), 'sitecues-metrics-data/'),
  RAW_DATA_SUBFOLDER: 'raw/',
  FINAL_CLEAN_DATA_SUBFOLDER: 'clean/',
  WORKING_CLEAN_DATA_SUBFOLDER: 'working/',
  BEGINNING_OF_TIME: '20160126'
};
