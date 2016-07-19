'use strict';

const locationGroups = require('./location-groups'),
  locationGroupsNames = Object.keys(locationGroups),
  shortenedDomain = require('./shortened-domain');

function getLocations(domain, siteId) {
  const locations = [ domain || '@malformed', siteId, '@any' ],
    domainSections = domain.split('.');

  // Split domain into smaller and smaller pieces and track those pieces.
  // Example #1: sightandsound.co.uk:
  // - sightandsound.co.uk, co.uk, .uk
  // Example #2: nursing.fullerton.edu:
  // - nursing.fullerton.edu, fullerton.edu, .edu
  for (let index = 1; index < domainSections.length - 1; index ++) {
    const partOfDomainFromHereToEnd = domainSections.slice(index).join('.');
    locations.push(partOfDomainFromHereToEnd);
  }
  locations.push('.' + domainSections[domainSections.length - 1 ]);  // So that we get convenient .com instead of com

  locationGroupsNames.forEach((locationGroupName) => {
    const locationGroup = locationGroups[locationGroupName];
    locations.forEach((location) => {
      if (locationGroup.has(location)) {
        locations.push(locationGroupName);
      }
    });
  });

  return locations;
}

function getLocationInfo(parsedEvent) {
  if (!parsedEvent.metadata.shortenedDomain) {
    parsedEvent.metadata.shortenedDomain = shortenedDomain(parsedEvent);
  }

  return getLocations(parsedEvent.metadata.shortenedDomain, parsedEvent.siteId);
}

module.exports = getLocationInfo;