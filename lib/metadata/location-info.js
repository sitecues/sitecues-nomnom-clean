const locationGroups = require('./location-groups'),
  locationGroupsNames = Object.keys(locationGroups),
  url = require('url');

function getShortenedDomain(parsedEvent) {
  "use strict";
  const pageUrl = parsedEvent.pageUrl;
  if (!pageUrl) {
    return '@unknown';
  }

  const hostname = url.parse(pageUrl).hostname;

  let parts = hostname.split('.');

  if (parts[0].startsWith('www')) {
    parts = parts.slice(1);
  }

  let result = parts.join('.');
  if (result.endsWith('.')) {
    result = result.slice(0, -1); // eeoc.gov. and amacusg.org. have extra periods!
  }
  return result;
}

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

  // Make the domain more readable
  if (locations[0] === domain) {
    locations[0] += ' (' + siteId + ')';
  }

  return locations;
}

function getLocationInfo(parsedEvent) {
  "use strict";
  const shortenedDomain = getShortenedDomain(parsedEvent),
    locations = getLocations(shortenedDomain, parsedEvent.siteId);

  return {
    shortenedDomain: shortenedDomain,
    locations: locations
  };
}

module.exports = getLocationInfo;