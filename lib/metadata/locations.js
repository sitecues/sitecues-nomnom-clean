'use strict';

const locationGroups = require('./location-groups'),
  locationPathMatch = require('./location-path-match');

function getLocations(parsedEvent, domain) {
  let locations = [ ],
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

  locations.concat(domain).forEach((location) => {
    const groupsToAdd = locationGroups[location];
    if (groupsToAdd) {
      locations = locations.concat(groupsToAdd);
    }
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
    if (usefulPathSubstrings && usefulPathSubstrings.length > 1) {
      return domain + '/' + usefulPathSubstrings.slice(1).join('/');
    }
  }
}

module.exports = getLocations;