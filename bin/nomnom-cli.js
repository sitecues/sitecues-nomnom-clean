#!/usr/bin/env node

'use strict';

// Crash and burn, die fast if a rejected promise is not caught.
process.on('unhandledRejection', function (err) {
  throw err;
});

const
  options = require('yargs').usage('Usage: $0 <command> [options]')
    .describe('reports', 'Comma-separated lists of reports from lib/reports/ folder (default = all)')
    .string('reports')
    .describe('startDate', 'Start date in the format YYYYMMDD')
    .number('startDate')
    .describe('endDate', 'End date in the format YYYYMMDD')
    .number('endDate')
    .describe('keepTopEvents', 'Sample n top events from each day -- very fast but does not provide truly representative sample.')
    .number('keepTopEvents')
    .describe('eventStep', 'Sample every nth item')
    .number('eventStep')
    .describe('daysStep', 'Sample every nth day')
    .number('dayStep')
    .describe('siteId', 'Limit to a single site id')
    .string('siteId')
    .describe('doLogDebugInfo', 'Log debug info?')
    .default('doLogDebugInfo', true)
    .boolean('doLogDebugInfo')
    .help('h')
    .alias('h', 'help')
    .argv,
  reporter = require('../lib/reporter.js'),
  RESULTS_FILENAME = 'data/compiled/all.json';

reporter(options)
  .then(function (result) {
    console.log('Writing to ' + RESULTS_FILENAME);
    require('fs').writeFileSync(RESULTS_FILENAME, JSON.stringify(result));
  });
