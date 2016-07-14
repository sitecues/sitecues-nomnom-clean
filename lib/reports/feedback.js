'use strict';

const userAgentParser = require('../added-info/ua-parser'),
  pseudoEventGenerator = require('../added-info/pseudo-events'),
  domainShortener = require('../added-info/domain-shortener'),
  all = {},
  byUa = {},
  byDomain = {};

let config;

function onData(dateIndex, parsedEvent) {
  if (parsedEvent.name !== 'feedback-sent') {
    return;
  }
  // Get parsed user agent info
  if (!parsedEvent.added.ua) {
    parsedEvent.added.ua = userAgentParser(parsedEvent);
  }

  if (!parsedEvent.added.shortenedDomain) {
    parsedEvent.added.shortenedDomain = domainShortener(parsedEvent);
  }

  const rating = parsedEvent.rating,
    ua = parsedEvent.added.ua,
    domain = parsedEvent.added.shortenedDomain,
    text = parsedEvent.feedbackText || '';

  if (!all[rating]) {
    all[rating] = [];
  }
  if (!byUa[ua]) {
    byUa[ua] = {};
  }
  if (!byUa[ua][rating]) {
    byUa[ua][rating] = [];
  }
  if (!byDomain[domain]) {
    byDomain[domain] = {};
  }
  if (!byDomain[domain][rating]) {
    byDomain[domain][rating] = [];
  }

  all[rating].push({ text });
  byUa[ua][rating].push({ text });
  byDomain[domain][rating].push({ text });
}

function init(_config) {
  config = _config;
}

function finalize() {
  return {
    all,
    byUa,
    byDomain
  };
}

module.exports = {
  init,
  onData,
  finalize
};
