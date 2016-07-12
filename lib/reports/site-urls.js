'use strict';

const siteIdToUrlsMap = {},
  siteIdToPrimaryDomainsMap = {},
  primaryDomainToSiteIdMap = {},
  url = require('url');

function onData(dateIndex, parsedEvent) {
  if (parsedEvent.name !== 'page-visited') {
    return;
  }

  const siteId = parsedEvent.siteId || parsedEvent.site_id,
    pageUrl = parsedEvent.pageUrl || parsedEvent.page_url,
    primaryDomain = getPrimaryDomain(pageUrl);

  addToMap(siteIdToUrlsMap, siteId, pageUrl);
  addToMap(siteIdToPrimaryDomainsMap, siteId, primaryDomain);
  primaryDomainToSiteIdMap[primaryDomain] = siteId;
}

// For convenience, returns texasat.net rather than www.texasat.net
function getPrimaryDomain(pageUrl) {
  const hostname = url.parse(pageUrl).hostname;
  let parts = hostname.split('.');

  if (parts.length > 2) {
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

function getPrimaryDomainsForSiteId(siteId) {
  return Object.keys(siteIdToPrimaryDomainsMap[siteId]);
}

function getSiteIdsWithMultiplePrimaryDomains(allSiteIds) {
  return allSiteIds.filter((siteId) => getPrimaryDomainsForSiteId(siteId).length > 1);
}

function init(_config) {
}

function finalize() {

  const allSiteIds = Object.keys(siteIdToUrlsMap),
    siteIdsWithMultiplePrimaryDomains = getSiteIdsWithMultiplePrimaryDomains(allSiteIds);

  return {
    allSiteIds,
    siteIdsWithMultiplePrimaryDomains,
    primaryDomainToSiteIdMap
  };
}

module.exports = {
  init,
  onData,
  finalize
};
