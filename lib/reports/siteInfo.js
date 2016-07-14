'use strict';

const siteIdToDomainsMap = {},
  domainToSiteIdMap = {},
  url = require('url');

function onData(dateIndex, parsedEvent) {
  if (parsedEvent.name !== 'page-visited') {
    return;
  }

  const siteId = parsedEvent.siteId || parsedEvent.site_id,
    pageUrl = parsedEvent.pageUrl || parsedEvent.page_url,
    domain = getInterestingPartOfDomain(pageUrl);

  addToMap(siteIdToDomainsMap, siteId, domain);
  domainToSiteIdMap[domain] = siteId;
}

// For convenience, returns texasat.net rather than www.texasat.net
function getInterestingPartOfDomain(pageUrl) {
  const hostname = url.parse(pageUrl).hostname;
  let parts = hostname.split('.');

  if (parts[0].startsWith('www')) {
    parts = parts.slice(1);
  }
  return parts.join('.');
}

function addToMap(map, siteId, url) {

  if (!map[siteId]) {
    map[siteId] = {};
  }

  map[siteId][url] = (map[siteId][url] || 0) + 1;
}

function getDomainsForSiteId(siteId) {
  return Object.keys(siteIdToDomainsMap[siteId]);
}

function getSiteIdsWithMultipleDomains(allSiteIds) {
  return allSiteIds.filter((siteId) => getDomainsForSiteId(siteId).length > 1);
}

function init(_config) {
}

function finalize() {

  const allSiteIds = Object.keys(siteIdToDomainsMap),
    siteIdsWithMultipleDomains = getSiteIdsWithMultipleDomains(allSiteIds);

  return {
    allSiteIds,
    siteIdsWithMultipleDomains,
    domainToSiteIdMap,
    siteIdToDomainsMap
  };
}

module.exports = {
  init,
  onData,
  finalize
};
