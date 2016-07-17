'use strict';

const siteIdToLocationsMap = {},
  locationToSiteIdMap = {},
  locationInfo = require('../added-info/location-info');

function onData(dateIndex, parsedEvent) {
  if (parsedEvent.name !== 'page-visited') {
    return;
  }

  const siteId = parsedEvent.siteId;

  if (!parsedEvent.added.locationInfo) {
    parsedEvent.added.locationInfo = locationInfo(parsedEvent);
  }

  const locations = parsedEvent.added.locationInfo.locations;

  for (let location of locations) {
    addToMap(locationToSiteIdMap, location, siteId);
    addToMap(siteIdToLocationsMap, siteId, location);
  }
}

function addToMap(map, key1, key2) {

  if (!map[key1]) {
    map[key1] = {};
  }

  map[key1][key2] = (map[key1][key2] || 0) + 1;
}

function getLocationsForSiteId(siteId) {
  return Object.keys(siteIdToLocationsMap[siteId]);
}

function getSiteIdsWithMultipleDomains(allSiteIds) {
  function numDomainsComparator(a, b) {
    return Object.keys(siteIdToLocationsMap[b]).length - Object.keys(siteIdToLocationsMap[a]).length;
  }
  const multiDomainSiteIds = allSiteIds.filter((siteId) => getLocationsForSiteId(siteId).length > 1);
  return multiDomainSiteIds.sort(numDomainsComparator);
}

function init(_config) {
}

function finalize() {

  const allSiteIds = Object.keys(siteIdToLocationsMap),
    siteIdsWithMultipleDomains = getSiteIdsWithMultipleDomains(allSiteIds);

  return {
    allSiteIds,
    siteIdsWithMultipleDomains,
    locationToSiteIdMap,
    siteIdToLocationsMap,
  };
}

module.exports = {
  init,
  onData,
  finalize
};
