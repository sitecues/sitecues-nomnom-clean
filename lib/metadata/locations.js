'use strict';

const locationGroups = require('./location-groups'),
  locationPathMatch = require('./location-path-match');

// We expose the version as a location
function getVersionGroup(parsedEvent) {
  const version = parsedEvent.scVersion;
  if (!version) {
    return '@v-unknown';
  }
  if (version.startsWith('3.')) {
    return '@v3.x';
  }
  if (version.startsWith('4.0')) {
    return '@v4.0.x';
  }
  if (version.startsWith('4.1')) {
    return '@v4.1.x';
  }
  return '@v' + version.replace('-RELEASE', '');
}

function getLocations(parsedEvent, domain) {
  if (!domain) {
    return [ ];
  }

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

  locations = [ domain, '#' + parsedEvent.siteId, '@any', getVersionGroup(parsedEvent) ].concat(locations);

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