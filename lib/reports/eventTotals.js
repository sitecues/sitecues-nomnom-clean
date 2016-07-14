'use strict';

const userAgentParser = require('../added-info/ua-parser'),
  pseudoEventGenerator = require('../added-info/pseudo-events'),
  domainShortener = require('../added-info/domain-shortener'),
  forSiteId = {},
  forDomain = {},
  forAnywhere = {},
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
    parsedEvent.added.shortenedDomain = domainShortener(parsedEvent);
  }

  const eventName = parsedEvent.name,
    uaName = parsedEvent.added.ua.browser,
    pseudoEvents = parsedEvent.added.pseudoEvents,
    domain = parsedEvent.added.shortenedDomain,
    siteId = parsedEvent.siteId,
    events = (pseudoEvents || []).concat(eventName);

  events.forEach((name) => {
    add(forDomain,   domain, name, uaName, dateIndex);
    add(forSiteId,   siteId, name, uaName, dateIndex);
    add(forAnywhere, 'any',  name, uaName, dateIndex);
    byNameOnly[name] = (byNameOnly[name] || 0) + 1;
  });

  byUserAgentOnly[uaName] = (byUserAgentOnly[uaName] || 0) + 1;
}

function add(map, where, eventName, uaName, dateIndex) {
  addTo(map, where, eventName, uaName, dateIndex);   // For specific user agent
  addTo(map, where, eventName, 'any',  dateIndex);   // For any user agent
}

function addTo(map, where, eventName, uaName, dateIndex) {
  if (!map[where]) {
    map[where] = {};
  }
  if (!map[where][eventName]) {
    map[where][eventName] = {};
  }
  if (!map[where][eventName][uaName]) {
    map[where][eventName][uaName] = createDateArray();
  }
  ++ map[where][eventName][uaName][dateIndex];
}

function createDateArray() {
  return new Array(config.numDates).fill(0);
}

function init(_config) {
  config = _config;
}

function finalize() {
  return {
    forSiteId,
    forDomain,
    forAnywhere,
    byNameOnly,
    byUserAgentOnly
  };
}

module.exports = {
  init,
  onData,
  finalize
};
