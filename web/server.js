'use strict';

const
  hapi = require('hapi'),
  server = new hapi.Server(),
  reporter =require('../lib/reporter.js'),
  serverOptions = {
    port: parseInt(process.env.PORT, 10) || 3001,
    routes: { cors: true }
  };

function getValidString(input, regex) {
  if (!input) {
    return '';
  }
  var output = input.match(regex);
  return output ? output[0] : '';
}

function getValidInteger(input) {
  if (!input) {
    return undefined;
  }

  var output = input.match(/\d+/)
  return output? parseInt(output[0]) : undefined;
}

server.connection(serverOptions);

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    const
      options = {
        reports: getValidString(request.query.reports, /[a-z,-]+/), // Only accept lowercase letters, comma, hyphen
        startDate: getValidInteger(request.query.startDate, /[a-z,-]+/), // Only accept lowercase letters, comma, hyphen
        endDate: getValidInteger(request.query.endDate, /[a-z,-]+/), // Only accept lowercase letters, comma, hyphen
        eventStep: getValidInteger(request.query.eventStep),
        keepTopEvents: getValidInteger(request.query.keepTopEvents),
        dayStep: getValidInteger(request.query.dayStep),
        siteId: getValidString(request.query.siteId),
        view: 'json'
      };
    console.log('Options:\n', options);
    reporter(options) // No need to catch errors for now -- just let exception through
      .then(function(rawReport) {
        reply(rawReport);
      });
  }
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});

