'use strict';

const userAgentParser = require('../added-info/ua-parser'),
  pseudoEventGenerator = require('../added-info/pseudo-events'),
  domainShortener = require('../added-info/domain-shortener'),
  locationGroups = require('../location-groups'),
  locationGroupsNames = Object.keys(locationGroups),
  byLocation = {},
  byNameOnly = {},
  byUserAgentOnly = {};

let config;

function onData(dateIndex, parsedEvent) {
  // Get parsed user agent info
  if (!parsedEvent.added.ua) {
    parsedEvent.added.ua = userAgentParser(parsedEvent);
  }

  if (!parsedEvent.added.pseudoEvents) {
    parsedEvent.added.pseudoEvents = pseudoEventGenerator(parsedEvent);
  }

  if (!parsedEvent.added.shortenedDomain) {
    parsedEvent.added.shortenedDomain = domainShortener(parsedEvent);
  }

  const eventName = parsedEvent.name,
    uaName = parsedEvent.added.ua.browser,
    pseudoEvents = parsedEvent.added.pseudoEvents,
    domain = parsedEvent.added.shortenedDomain,
    siteId = parsedEvent.siteId,
    events = (pseudoEvents || []).concat(eventName),
    locations = getLocations(domain, siteId);


  events.forEach((name) => {
    locations.forEach((location) => {
      add(location, name, uaName, dateIndex);
    });
    byNameOnly[name] = (byNameOnly[name] || 0) + 1;
  });

  byUserAgentOnly[uaName] = (byUserAgentOnly[uaName] || 0) + 1;
}

function getLocations(domain, siteId) {
  const locations = [ siteId, '@any', domain ],
    readableLocations = [ siteId, '@any', domain + ' (' + siteId + ')'],
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
        readableLocations.push(locationGroupName);
      }
    });
  });

  console.log(readableLocations);

  return readableLocations;
}

function add(location, eventName, uaName, dateIndex) {
  addTo(location, eventName, uaName, dateIndex);   // For specific user agent
  addTo(location, eventName, 'any',  dateIndex);   // For any user agent
}

function addTo(location, eventName, uaName, dateIndex) {
  if (!byLocation[location]) {
    byLocation[location] = {};
  }
  if (!byLocation[location][eventName]) {
    byLocation[location][eventName] = {};
  }
  if (!byLocation[location][eventName][uaName]) {
    byLocation[location][eventName][uaName] = createDateArray();
  }
  ++ byLocation[location][eventName][uaName][dateIndex];
}

function createDateArray() {
  return new Array(config.numDates).fill(0);
}

function init(_config) {
  config = _config;
}

function finalize() {
  return {
    byNameOnly,
    byUserAgentOnly
  };
}

module.exports = {
  init,
  onData,
  finalize
};
