'use strict';

const EXTENSION_IDS = new Set(['s-70b96e72', 's-1596260c', 's-482d53c7']),
  TEST_IDS = new Set(['s-1f9c2da4']),
  IP_ADDRESS_REGEX = /^https?:\/\/\d/,
  LOCALHOST_REGEX = /^https?:\/\/localhost/,
  PROXY_URL_REGEX =/^https?:\/\/proxy\./,
  HELP_SCREEN_REGEX = /^https?:\/\/js\.sitecues\.com\//;

function shouldKeep(parsedEvent) {
  if (parsedEvent.doIgnore || parsedEvent.isTester) {
    return false;
  }

  if (!parsedEvent.meta.domain ||   // Weird URLS like www/google.com or www.google/com, often with mtsac site id
    parsedEvent.siteId === 's-00000005' ||
    parsedEvent.source === 'reverse-proxy' ||
    parsedEvent.source === 'forward-proxy' ||
    !parsedEvent.pageUrl.startsWith('http') ||
    parsedEvent.pageUrl.match(IP_ADDRESS_REGEX) ||
    parsedEvent.pageUrl.match(LOCALHOST_REGEX) ||
    parsedEvent.pageUrl.match(PROXY_URL_REGEX)) {
    // File protocol and ip addresses are a sign of a tester
    return false;
  }

  if (parsedEvent.source ? parsedEvent.source === 'extension' : EXTENSION_IDS.has(parsedEvent.siteId)) {
    parsedEvent.source = 'extension';
    return false;
  }

  if (TEST_IDS.has(parsedEvent.siteId)) {
    return false;
  }

  if (parsedEvent.pageUrl.match(HELP_SCREEN_REGEX)) {
    return false; // Sitecues help screen
  }

  return true;
}

module.exports = shouldKeep;