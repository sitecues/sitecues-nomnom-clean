'use strict';

// Correct mistakes introduced in various versions of Sitecues
// TODO solve mystery: why does EEOC site id have so many weird pageUrls
const
  repairFieldNames = require('./field-names'),
  repairSiteId = require('./site-id'),
  repairPanelClickedTarget = require('./panel-clicked-target'),
  shortenedDomain = require('../metadata/shortened-domain'),
  shouldIgnore = require('./should-ignore'),
  eventSpecificRepair = {
    'panel-clicked': repairPanelClickedTarget,
    'feedback-send': repairFeedbackSendName
  };

function repairFeedbackSendName(parsedEvent) {
  parsedEvent.name = 'feedback-sent';
}

// Return true for events we want to keep, false to ignore
function fixParsedEvent(parsedEvent) {
  // Field names
  repairFieldNames(parsedEvent);

  // Add metadata object
  parsedEvent.metadata = {
    shortenedDomain: shortenedDomain(parsedEvent)
  };

  // Ignore?
  if (shouldIgnore(parsedEvent)) {
    return false;
  }

  // Site ID
  repairSiteId(parsedEvent);

  // Event-specific fixes
  const eventSpecificRepairFn = eventSpecificRepair[parsedEvent.name];
  if (eventSpecificRepairFn) {
    eventSpecificRepairFn(parsedEvent);
  }

  return true;
}

module.exports = fixParsedEvent;