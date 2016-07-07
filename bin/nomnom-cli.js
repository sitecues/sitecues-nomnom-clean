#!/usr/bin/env node

'use strict';

// Crash and burn, die fast if a rejected promise is not caught.
process.on('unhandledRejection', function (err) {
  throw err;
});

const
  constants = require('../lib/constants'),
  config = require('yargs').usage('Usage: $0 <command> [options]')
    .describe('reports', 'Comma-separated lists of reports from lib/reports/ folder (default = all)')
    .string('reports')
    .describe('startDate', 'Start date in the format YYYYMMDD')
    .number('startDate')
    .describe('endDate', 'End date in the format YYYYMMDD')
    .number('endDate')
    .describe('view', 'Name of view to use, e.g. text|json|html (default = json)')
    .string('view')
    .help('h')
    .alias('h', 'help')
    .argv,
  reporter = require('../lib/reporter.js');

reporter(config)
  .then(function (rawReports) {
    console.log('\n\nWriting reports ...');
    rawReports.forEach((rawReport) => {
      console.log(rawReport);
      console.log('Finished');
    });
  });
