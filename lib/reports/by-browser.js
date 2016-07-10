'use strict';

const userAgentParser = require('../added-info/ua-parser'),
  totals = {},
  totalsByUaAndDate = {},
  totalsByUa = {},
  totalsByDate = {};

function onData(dateIndex, parsedEvent) {
  const eventName = parsedEvent.name;

  // Get parsed user agent info
  if (!parsedEvent.added.ua) {
    parsedEvent.added.ua = userAgentParser(parsedEvent);
  }

  let uaName = parsedEvent.added.ua.browser;

  // Overall total
  if (!totals[eventName]) {
    totals[eventName] = [];
  }
  totals[eventName][dateIndex] = (totals[eventName][dateIndex] || 0) + 1;

  // By date only
  if (!totalsByDate[eventName]) {
    totalsByDate[eventName] = [];
  }
  totalsByDate[eventName][dateIndex] = (totalsByDate[eventName][dateIndex] || 0) + 1;

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
    totalsByUaAndDate[eventName][uaName] = [];
  }
  totalsByUaAndDate[eventName][uaName][dateIndex] = (totalsByUaAndDate[eventName][uaName][dateIndex] || 0) + 1;
}

function finalize() {
  return {
    name: 'Total page-visited events by browser and date', // TODO which event?
    result: {
      totals,
      totalsByUa,
      totalsByDate,
      totalsByUaAndDate
    }
  };
}

module.exports = {
  onData,
  finalize
};
