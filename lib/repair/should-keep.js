'use strict';

const EXTENSION_IDS = new Set(['s-70b96e72', 's-1596260c', 's-482d53c7']),
  TEST_IDS = new Set(['s-1f9c2da4', 's-00000005' ]),
  IP_ADDRESS_REGEX = /^https?:\/\/\d/,
  LOCALHOST_REGEX = /^https?:\/\/localhost/,
  PROXY_URL_REGEX =/^https?:\/\/proxy\./,
  HELP_SCREEN_REGEX = /^https?:\/\/js\.sitecues\.com\//;

function shouldKeep(parsedEvent) {
  if (parsedEvent.doIgnore) {
    // console.log('doIgnore');
    // console.log(JSON.stringify(parsedEvent));
    return false;
  }
  if (parsedEvent.isTester || TEST_IDS.has(parsedEvent.siteId) || parsedEvent.source === 'reverse-proxy' ||
    parsedEvent.source === 'forward-proxy' || (parsedEvent.scVersion && !parsedEvent.scVersion.includes('-RELEASE'))) {
    // console.log('isTester');
    // console.log(JSON.stringify(parsedEvent));
    return false;
  }

  // If it has a user id, it must be a string
  // Note: unsupported user agents don't have user ids
  if (parsedEvent.userId && typeof parsedEvent.userId !== 'string') {
    return false;
  }

  if (!parsedEvent.meta.domain ||   // Weird URLS like www/google.com or www.google/com, often with mtsac site id
    !parsedEvent.pageUrl.startsWith('http') || // Wrong protocol
    // Caching domains
    parsedEvent.meta.domain.endsWith('.googleusercontent.com') ||
    parsedEvent.meta.domain.endsWith('.baiducontent.com') ||
    parsedEvent.meta.domain.endsWith('.bingj.com') ||
    parsedEvent.meta.domain.endsWith('.ql2.com') ||
    parsedEvent.meta.domain.endsWith('.proxy4me.com') ||
    parsedEvent.meta.domain.endsWith('.cloudtranslation.cc') ||
    parsedEvent.meta.domain.endsWith('.proxyfly.org') ||
    parsedEvent.meta.domain.endsWith('.archive.org') ||
    parsedEvent.pageUrl.match(HELP_SCREEN_REGEX) ||
    parsedEvent.pageUrl.match(IP_ADDRESS_REGEX) ||
    parsedEvent.pageUrl.match(LOCALHOST_REGEX) ||
    parsedEvent.pageUrl.match(PROXY_URL_REGEX)) {
    // File protocol and ip addresses are a sign of a tester
    return false;
  }

  if (parsedEvent.source ? parsedEvent.source === 'extension' : EXTENSION_IDS.has(parsedEvent.siteId)) {
    parsedEvent.source = 'extension';
    // console.log('Extension');
    // console.log(JSON.stringify(parsedEvent));
    return false;
  }

  return true;
}

module.exports = shouldKeep;