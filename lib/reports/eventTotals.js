'use strict';

const userAgentParser = require('../added-info/ua-parser'),
  pseudoEventGenerator = require('../added-info/pseudo-events'),
  locationInfo = require('../added-info/location-info'),
  byLocation = {},
  byNameOnly = {},
  byUserAgentOnly = {};

let config;

function onData(dateIndex, parsedEvent) {
  // Get parsed user agent info
  if (!parsedEvent.added.ua) {
    parsedEvent.added.ua = userAgentParser(parsedEvent);
  }

  if (!parsedEvent.added.pseudoEvents) {
    parsedEvent.added.pseudoEvents = pseudoEventGenerator(parsedEvent);
  }

  if (!parsedEvent.added.shortenedDomain) {
    parsedEvent.added.shortenedDomain = locationInfo(parsedEvent);
  }

  if (!parsedEvent.added.locationInfo) {
    parsedEvent.added.locationInfo = locationInfo(parsedEvent);
  }

  const eventName = parsedEvent.name,
    uaNames = parsedEvent.added.ua.groups.concat(parsedEvent.added.ua.browser),
    pseudoEvents = parsedEvent.added.pseudoEvents,
    events = (pseudoEvents || []).concat(eventName),
    locations = parsedEvent.added.locationInfo.locations;

  events.forEach((eventName) => {
    locations.forEach((location) => {
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
