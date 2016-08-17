'use strict';

const EXTENSION_IDS = new Set(['#s-70b96e72', '#s-1596260c', '#s-482d53c7']),
  TEST_IDS = new Set(['#s-1f9c2da4']),
  IP_ADDRESS_REGEX = /^https?:\/\/\d/,
  LOCALHOST_REGEX = /^https?:\/\/localhost/,
  PROXY_URL_REGEX =/^https?:\/\/proxy\./,
  HELP_SCREEN_REGEX = /^https?:\/\/js\.sitecues\.com\//;

function shouldIgnore(parsedEvent) {
  if (!parsedEvent.pageUrl ||
    !parsedEvent.browserUserAgent || // Almost never happens
    !parsedEvent.metadata.shortenedDomain ||   // Weird URLS like www/google.com or www.google/com, often with mtsac site id
    parsedEvent.siteId === '#s-00000005' ||
    parsedEvent.source === 'reverse-proxy' ||
    parsedEvent.source === 'forward-proxy' || !parsedEvent.pageUrl.startsWith('http') ||
    parsedEvent.pageUrl.match(IP_ADDRESS_REGEX) ||
    parsedEvent.pageUrl.match(LOCALHOST_REGEX) ||
    parsedEvent.pageUrl.match(PROXY_URL_REGEX)) {
    // File protocol and ip addresses are a sign of a tester
    return true;
  }

  if (parsedEvent.source ? parsedEvent.source === 'extension' : EXTENSION_IDS.has(parsedEvent.siteId)) {
    parsedEvent.source = 'extension';
    return true;
  }

  if (TEST_IDS.has(parsedEvent.siteId)) {
    return true;
  }

  if (parsedEvent.pageUrl.match(HELP_SCREEN_REGEX)) {
    return true; // Sitecues help screen
  }
}

module.exports = shouldIgnore;