'use strict';

const locationGroups = require('./location-groups'),
  locationGroupsNames = Object.keys(locationGroups),
  locationPathMatch = require('./location-path-match'),
  shortenedDomain = require('./shortened-domain');

function getLocations(parsedEvent) {
  const domain = parsedEvent.metadata.shortenedDomain,
    siteId = parsedEvent.siteId,
    locations = [ domain || '@malformed', siteId, '@any' ],
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

  const usefulPath = getUsefulPath(domain, parsedEvent.pageUrl);
  if (usefulPath) {
    locations.push(usefulPath);
  }

  return locations;
}

function getUsefulPath(domain, pageUrl) {
  const pathRegex = locationPathMatch[domain];
  if (pathRegex) {
    // https://catalog.ocln.org/client/en_US/plymouth => catalog.ocln.org/plymouth
    const usefulPathSubstrings = pageUrl.match(pathRegex);
    if (usefulPathSubstrings) {
      return domain + '/' + usefulPathSubstrings.slice(1).join('/');
    }
  }
}

function getLocationInfo(parsedEvent) {
  if (!parsedEvent.metadata.shortenedDomain) {
    parsedEvent.metadata.shortenedDomain = shortenedDomain(parsedEvent);
  }

  return getLocations(parsedEvent)
}

module.exports = getLocationInfo;