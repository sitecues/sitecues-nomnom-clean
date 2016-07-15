'use strict';

// Fix incorrectly reported data in an event

function fixParsedEvent(parsedEvent) {
  parsedEvent.pageUrl = parsedEvent.pageUrl || parsedEvent.page_url;

  // trim() the site id because one siteId has a space in it
  parsedEvent.siteId = (parsedEvent.siteId || parsedEvent.site_id || 'unknown').trim()

  if (parsedEvent.name === 'feedback-send') {
    parsedEvent.name = 'feedback-sent';
  }

  return parsedEvent;
}

module.exports = fixParsedEvent;