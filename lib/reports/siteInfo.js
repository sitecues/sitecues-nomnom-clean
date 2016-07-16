'use strict';

const siteIdToDomainsMap = {},
  domainToSiteIdMap = {},
  domainShortener = require('../added-info/domain-shortener');

function onData(dateIndex, parsedEvent) {
  if (parsedEvent.name !== 'page-visited') {
    return;
  }

  const siteId = parsedEvent.siteId;

  if (!parsedEvent.added.shortenedDomain) {
    parsedEvent.added.shortenedDomain = domainShortener(parsedEvent);
  }

  const domain = parsedEvent.added.shortenedDomain;

  addToMap(siteIdToDomainsMap, siteId, domain);
  domainToSiteIdMap[domain] = siteId;
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
  function numDomainsComparator(a, b) {
    return Object.keys(siteIdToDomainsMap[b]).length - Object.keys(siteIdToDomainsMap[a]).length;
  }
  const multiDomainSiteIds = allSiteIds.filter((siteId) => getDomainsForSiteId(siteId).length > 1);
  return multiDomainSiteIds.sort(numDomainsComparator);
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
    siteIdToDomainsMap,
  };
}

module.exports = {
  init,
  onData,
  finalize
};
