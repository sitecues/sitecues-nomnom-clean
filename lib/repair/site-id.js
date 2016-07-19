/**
 * Created by aaron on 7/19/16.
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
    console.log(`Repaired ${parsedEvent.pageUrl} to ${siteId}`);
  }
  parsedEvent.siteId = siteId;
}

module.exports = repairSiteId;