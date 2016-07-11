'use strict';

const userAgentParser = require('../added-info/ua-parser'),
  pseudoEventGenerator = require('../added-info/pseudo-events'),
  totals = {},
  totalsByUaAndDate = {},
  totalsByUa = {},
  totalsByDate = {};

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
  totals[eventName] = (totals[eventName] || 0) + 1;

  // By date only
  if (!totalsByDate[eventName]) {
    totalsByDate[eventName] = createDateArray();
  }
  totalsByDate[eventName][dateIndex] ++;

  // By UA only
  if (!totalsByUa[eventName]) {
    totalsByUa[eventName] = {};
  }
  totalsByUa[eventName][uaName] = (totalsByUa[eventName][uaName] || 0) + 1;

  // By UA and date
  if (!totalsByUaAndDate[eventName]) {
    totalsByUaAndDate[eventName] = {};
  }
  if (!totalsByUaAndDate[eventName][uaName]) {
    totalsByUaAndDate[eventName][uaName] = createDateArray();;
  }
  totalsByUaAndDate[eventName][uaName][dateIndex] ++;
}

function createDateArray() {
  return new Array(config.numDates).fill(0);
}

function init(_config) {
  config = _config;
}

function finalize() {
  return {
    name: 'Event totals sliced different ways',
    result: {
      totals,
      totalsByUa,
      totalsByDate,
      totalsByUaAndDate
    }
  };
}

module.exports = {
  init,
  onData,
  finalize
};
