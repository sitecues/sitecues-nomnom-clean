'use strict';

const userAgentParser = require('../added-info/ua-parser'),
  pseudoEventGenerator = require('../added-info/pseudo-events'),
  all = {},
  byUaAndDate = {},
  byUa = {},
  byDate = {};

let config;

function onData(dateIndex, parsedEvent) {
  // Get parsed user agent info
  if (!parsedEvent.added.ua) {
    parsedEvent.added.ua = userAgentParser(parsedEvent);
  }

  if (!parsedEvent.added.pseudoEvents) {
    parsedEvent.added.pseudoEvents = pseudoEventGenerator(parsedEvent);
  }

  const eventName = parsedEvent.name,
    uaName = parsedEvent.added.ua.browser,
    pseudoEvents = parsedEvent.added.pseudoEvents;

  add(dateIndex, eventName, uaName);

  if (pseudoEvents) {
    pseudoEvents.forEach((pseudoEventName) => add(dateIndex, eventName + '::' + pseudoEventName, uaName));
  }
}

function add(dateIndex, eventName, uaName) {

  // Overall total
  all[eventName] = (all[eventName] || 0) + 1;

  // By date only
  if (!byDate[eventName]) {
    byDate[eventName] = createDateArray();
  }
  byDate[eventName][dateIndex] ++;

  // By UA only
  if (!byUa[eventName]) {
    byUa[eventName] = {};
  }
  byUa[eventName][uaName] = (byUa[eventName][uaName] || 0) + 1;

  // By UA and date
  if (!byUaAndDate[eventName]) {
    byUaAndDate[eventName] = {};
  }
  if (!byUaAndDate[eventName][uaName]) {
    byUaAndDate[eventName][uaName] = createDateArray();;
  }
  byUaAndDate[eventName][uaName][dateIndex] ++;
}

function createDateArray() {
  return new Array(config.numDates).fill(0);
}

function init(_config) {
  config = _config;
}

function finalize() {
  return {
    all,
    byUa,
    byDate,
    byUaAndDate
  };
}

module.exports = {
  init,
  onData,
  finalize
};
