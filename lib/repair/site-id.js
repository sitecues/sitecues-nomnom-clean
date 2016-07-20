/**
 * Repair site id
 * TODO: look into getting site id from outer parsed JSON (was passed into metrics system via url param)
 */

'use strict';

function getMissingSiteId(parsedEvent) {
  const siteInfo = require('../reports/siteInfo'),
    UNKNOWN_SITE_ID = '#s-????????';

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