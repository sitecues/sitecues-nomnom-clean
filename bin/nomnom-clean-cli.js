#!/usr/bin/env node

'use strict';

// Crash and burn, die fast if a rejected promise is not caught.
process.on('unhandledRejection', function (err) {
  throw err;
});

const
  options = require('yargs').usage('Usage: $0 <command> [options]')
    .describe('start', 'Start either as a filename, or a date in the format YYYYMMDD')
    .string('start')
    .describe('end', 'End either as a filename, or a date in the format YYYYMMDD')
    .string('end')
    .describe('datafolder', 'Location of data')
    .string('datafolder')
    .describe('force', 'Create new clean versions of all data files, even if clean versions already exist')
    .boolean('force')
    .describe('clean', 'Clean output folder before beginning')
    .boolean('clean')
    .describe('quiet', 'Silence debug info?')
    .default('quiet', false)
    .boolean('quiet')
    .help('h')
    .alias('h', 'help')
    .argv,
  clean = require('../lib/clean-all.js');

clean(options);
