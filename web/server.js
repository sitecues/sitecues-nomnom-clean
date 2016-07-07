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

server.connection(serverOptions);

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    const
      config = {
        reports: getValidString(request.query.reports, /[a-z,-]+/), // Only accept lowercase letters, comma, hyphen
        view: 'json'
      };
    reporter(config) // No need to catch errors for now -- just let exception through
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

