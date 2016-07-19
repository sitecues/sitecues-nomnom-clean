'use strict';

const userAgentParser = require('../metadata/ua-parser'),
  shortenedDomain = require('../metadata/shortened-domain'),
  all = {},
  byUa = {},
  byDomain = {};

let config;

function onData(dateIndex, parsedEvent) {
  if (parsedEvent.name !== 'feedback-sent') {
    return;
  }
  // Get parsed user agent info
  if (!parsedEvent.metadata.ua) {
    parsedEvent.metadata.ua = userAgentParser(parsedEvent);
  }

  if (!parsedEvent.metadata.shortenedDomain) {
    parsedEvent.metadata.shortenedDomain = shortenedDomain(parsedEvent);
  }

  const rating = parsedEvent.details.rating,
    ua = parsedEvent.metadata.ua,
    domain = parsedEvent.metadata.shortenedDomain,
    text = parsedEvent.details.feedbackText || '';

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
