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
    .describe('dryRun', 'Don\'t actually save results')
    .boolean('dryRun')
    .describe('doLogDebugInfo', 'Log debug info?')
    .default('doLogDebugInfo', true)
    .boolean('doLogDebugInfo')
    .help('h')
    .alias('h', 'help')
    .argv,
  clean = require('../lib/clean.js');

clean(options);
