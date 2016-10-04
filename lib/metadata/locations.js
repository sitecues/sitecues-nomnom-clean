'use strict';

const locationGroups = require('./location-groups'),
  locationPathMatch = require('./location-path-match');

// We expose the version as a location
function getVersionGroups(parsedEvent) {
  const version = parsedEvent.version;
  if (!version) {
    return '@v-unknown';
  }

  // Old versions: we don't need info on point releases (bug fixes)
  if (version.startsWith('3.')) {
    return '@v3.x'; // Only major version
  }
  if (version.startsWith('4.0')) {
    return '@v4.0.x'; // General version group
  }
  if (version.startsWith('4.1')) {
    return '@v4.1.x'; // General version group
  }

  // Newer versions: include general version group (e.g. @v4.2.x) as well as point release group (@v4.2.11)
  const versionSplit = version.split('.'),
    generalVersionGroup = '@v' + versionSplit[0] + '.' + versionSplit[1] + '.x',
    pointReleaseGroup = '@v' + version;
  return [ pointReleaseGroup, generalVersionGroup ];
}

// Groups such as @toolbar, @pagebadge
function getBadgeGroups(parsedEvent) {

  const isBadgeHidden = parsedEvent.details && (parsedEvent.details.isBadgeHidden || parsedEvent.details.isUnsupportedPlatform);
  if (isBadgeHidden) {
    return [];
  }

  if (!parsedEvent.badgePalette) {
    // If badgePalette is NOT defined, then we don't know anything about the badge
    // If badgePalette is defined then we have additional view info such as:
    // Toolbar:
    //   isToolbar === true
    // Page badge:
    //   badgeHeight
    //   badgeTop
    //   badgeLeft
    return [];
  }

  if (parsedEvent.isToolbar) {
    return '@toolbar';
  }

  // Pagebadge -- provide interesting groups
  const isLeft = parsedEvent.badgeLeft < 500,
    isRight = parsedEvent.badgeLeft > 999,
    isTop = parsedEvent.badgeTop < 300,
    isBottom = parsedEvent.badgeTop > 700;
  let badgeGroups = [
    '@pagebadge',
    '@pagebadge-reverse-' + parsedEvent.badgePalette,
    '@pagebadge-height-' + parsedEvent.badgeHeight
  ];

  if (isLeft) {
    badgeGroups = badgeGroups.concat('@pagebadge-left');
  }
  if (isRight) {
    badgeGroups = badgeGroups.concat('@pagebadge-right');
  }
  if (isTop) {
    badgeGroups = badgeGroups.concat('@pagebadge-top');
  }
  if (isBottom) {
    badgeGroups = badgeGroups.concat('@pagebadge-bottom');
  }
  return badgeGroups;
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

  locations = [ domain, '#' + parsedEvent.siteId, '@any' ]
    .concat(getVersionGroups(parsedEvent))
    .concat(getBadgeGroups(parsedEvent))
    .concat(locations);

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