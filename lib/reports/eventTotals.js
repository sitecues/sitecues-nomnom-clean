'use strict';

const userAgentParser = require('../metadata/ua-parser'),
  pseudoEventGenerator = require('../metadata/pseudo-events'),
  locations = require('../metadata/locations'),
  byLocation = {},
  byNameOnly = {},
  byUserAgentOnly = {};

let config;

function onData(dateIndex, parsedEvent) {
  // Get parsed user agent info
  if (!parsedEvent.metadata.ua) {
    parsedEvent.metadata.ua = userAgentParser(parsedEvent);
  }

  if (!parsedEvent.metadata.pseudoEvents) {
    parsedEvent.metadata.pseudoEvents = pseudoEventGenerator(parsedEvent);
  }

  if (!parsedEvent.metadata.locations) {
    parsedEvent.metadata.locations = locations(parsedEvent);
  }

  const eventName = parsedEvent.name,
    uaNames = parsedEvent.metadata.ua.groups.concat(parsedEvent.metadata.ua.browser),
    pseudoEvents = parsedEvent.metadata.pseudoEvents,
    events = (pseudoEvents || []).concat(eventName);

  events.forEach((eventName) => {
    parsedEvent.metadata.locations.forEach((location) => {
      add(location, eventName, uaNames, dateIndex);
    });
    byNameOnly[eventName] = (byNameOnly[eventName] || 0) + 1;
  });

  for (let uaName of uaNames) {
    byUserAgentOnly[uaName] = (byUserAgentOnly[uaName] || 0) + 1;
  }
}

function add(location, eventName, uaNames, dateIndex) {
  for (let uaName of uaNames) {
    addTo(location, eventName, uaName, dateIndex);   // For specific user agent or group
  }
}

function addTo(location, eventName, uaName, dateIndex) {
  if (!byLocation[location]) {
    byLocation[location] = {};
  }
  if (!byLocation[location][eventName]) {
    byLocation[location][eventName] = {};
  }
  if (!byLocation[location][eventName][uaName]) {
    byLocation[location][eventName][uaName] = createDateArray();
  }
  ++ byLocation[location][eventName][uaName][dateIndex];
}

function createDateArray() {
  return new Array(config.numDates).fill(0);
}

function init(_config) {
  config = _config;
}

function finalize() {
  return {
    byNameOnly,
    byUserAgentOnly,
    byLocation
  };
}

module.exports = {
  init,
  onData,
  finalize
};
