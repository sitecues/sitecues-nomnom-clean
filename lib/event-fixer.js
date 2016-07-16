'use strict';

// Fix incorrectly reported data in an event

const EXTENSION_IDS = new Set(['s-70b96e72', 's-1596260c', 's-482d53c7']),
  TEST_IDS = new Set(['1f9c2da4']);


function fixParsedEvent(parsedEvent) {
  parsedEvent.pageUrl = parsedEvent.pageUrl || parsedEvent.page_url;

  // trim() the site id because one siteId has a space in it
  parsedEvent.siteId = (parsedEvent.siteId || parsedEvent.site_id || '@unknown').trim()

  if (parsedEvent.name === 'feedback-send') {
    parsedEvent.name = 'feedback-sent';
  }

  if (parsedEvent.source !== 'page') {
    parsedEvent.doIgnore = true;
  }
  else if (parsedEvent.siteId === 's-00000005' || parsedEvent.source === 'reverse-proxy' || parsedEvent.source === 'forward-proxy') {
    parsedEvent.isTester = true;
    parsedEvent.doIgnore = true;
  }
  else if (EXTENSION_IDS.has(parsedEvent.siteId) && !parsedEvent.source) {
    parsedEvent.source = 'extension';
    parsedEvent.doIgnore = true;
  }
  else if (TEST_IDS.has(parsedEvent.siteId)) {
    parsedEvent.doIgnore = true;
  }
  else if (parsedEvent.pageUrl.startsWith('file:')) {
    parsedEvent.isTester = true;
    parsedEvent.doIgnore = true;
    if (parsedEvent.pageUrl.includes('poo_master')) {
      console.log('The Poo Master ... has been unmasked ... as ' + parsedEvent.siteId + ' !!!');
    }
  }

  return parsedEvent;
}

module.exports = fixParsedEvent;