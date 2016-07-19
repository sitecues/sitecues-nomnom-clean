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

  const uaNames = parsedEvent.metadata.ua.groups.concat(parsedEvent.metadata.ua.browser),
    pseudoEvents = parsedEvent.metadata.pseudoEvents,
    events = (pseudoEvents || []).concat(parsedEvent.name),
    allLocations = parsedEvent.metadata.locations;

  for (let eventName of events) {
    for (let location of allLocations) {
      for (let uaName of uaNames) {
        if (!byLocation[location]) {
          byLocation[location] = {};
          byLocation[location][eventName] = {};
          byLocation[location][eventName][uaName] = createDateArray();
        }
        else if (!byLocation[location][eventName]) {
          byLocation[location][eventName] = {};
          byLocation[location][eventName][uaName] = createDateArray();
        }
        else if (!byLocation[location][eventName][uaName]) {
          byLocation[location][eventName][uaName] = createDateArray();
        }
        ++ byLocation[location][eventName][uaName][dateIndex];
      }
    }
    byNameOnly[eventName] = (byNameOnly[eventName] || 0) + 1;
  }

  for (let uaName of uaNames) {
    byUserAgentOnly[uaName] = (byUserAgentOnly[uaName] || 0) + 1;
  }
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
