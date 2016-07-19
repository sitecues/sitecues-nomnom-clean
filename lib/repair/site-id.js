/**
 * Repair site id
 * TODO: look into getting site id from outer parsed JSON (was passed into metrics system via url param)
 */

'use strict';

function getMissingSiteId(parsedEvent) {
  const shortenedDomain = require('../metadata/shortened-domain'),
    siteInfo = require('../reports/siteInfo'),
    UNKNOWN_SITE_ID = '#s-????????';

  if (!parsedEvent.metadata.shortenedDomain) {
    parsedEvent.metadata.shortenedDomain = shortenedDomain(parsedEvent);
  }

  return siteInfo.getSiteIdFor(parsedEvent.metadata.shortenedDomain) || UNKNOWN_SITE_ID;
}

function repairSiteId(parsedEvent) {
  let siteId = parsedEvent.siteId;
  // trim() the site id because one siteId has a space in it
  if (siteId) {
    siteId = '#' + siteId.trim();
  }
  else {
    siteId = getMissingSiteId(parsedEvent);
  }
  parsedEvent.siteId = siteId;
}

module.exports = repairSiteId;