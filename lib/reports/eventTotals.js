'use strict';

const userAgentParser = require('../metadata/ua-parser'),
  pseudoEventGenerator = require('../metadata/pseudo-events'),
  locations = require('../metadata/locations'),
  byLocation = {},
  byNameOnly = {},
  byUserAgentOnly = {};

let config;

function getUserAgentNames(parsedEvent) {
  const ua = parsedEvent.metadata.ua,
    browser = ua.browser,
    uaNames = ua.groups.concat(browser);

  if (browser === 'IE' && ua.browserVersion < 11) {
    return uaNames.concat('IE' + ua.browserVersion);
  }
  else if (browser === 'Safari') {
    return uaNames.concat('Safari' + ua.browserVersion);
  }

  return uaNames;
}

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

  const uaNames = getUserAgentNames(parsedEvent),
    pseudoEvents = parsedEvent.metadata.pseudoEvents,
    events = (pseudoEvents || []).concat(parsedEvent.name),
    allLocations = parsedEvent.metadata.locations;

  let locationMap, eventNameMap, uaMap;

  // TODO optimize this more -- we spend a lot of time in here
  for (let location of allLocations) {
    locationMap = byLocation[location];
    if (!locationMap) {
      locationMap = byLocation[location] = {};
    }
    for (let eventName of events) {
      eventNameMap = locationMap[eventName];
      if (!eventNameMap) {
        eventNameMap = locationMap[eventName] = {};
      }
      for (let uaName of uaNames) {
        uaMap = eventNameMap[uaName];
        if (!uaMap) {
          uaMap = eventNameMap[uaName] = createDateArray();
        }
        ++ uaMap[dateIndex];
      }
    }
  }
  for (let eventName of events) {
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
