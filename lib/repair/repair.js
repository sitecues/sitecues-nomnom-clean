'use strict';

// Repairs one event
// - Correct mistakes introduced in various versions of Sitecues
// - Add metadata
// - Remove unnecessary fields
// TODO solve mystery: why does EEOC site id have so many weird pageUrls
const
  repairFieldNames = require('./field-names'),
  repairPanelClickedTarget = require('./panel-clicked-target'),
  shouldKeep = require('./should-keep'),
  metaData = require('../metadata/metadata'),
  removeUnusedFields = require('./remove-unused-fields'),

  eventSpecificRepair = {
    'panel-clicked': repairPanelClickedTarget,
    'feedback-send': repairFeedbackSendName
  };

function repairFeedbackSendName(parsedEvent) {
  parsedEvent.name = 'feedback-sent';
}

// Return true for events we want to keep, false to ignore
function fixParsedEvent(parsedEvent, backupSiteId) {
  // Field names
  repairFieldNames(parsedEvent);

  // Check that basic info is available
  if (!parsedEvent.pageUrl ||
    !parsedEvent.browserUserAgent) { // Almost never happens
    return false;
  }

  // Site ID
  if (!parsedEvent.siteId) {
    parsedEvent.siteId = backupSiteId;
  }

  // Event-specific fixes
  const eventSpecificRepairFn = eventSpecificRepair[parsedEvent.name];
  if (eventSpecificRepairFn) {
    eventSpecificRepairFn(parsedEvent);
  }

  // Metadata
  parsedEvent.meta = metaData(parsedEvent);

  // Keep or ignore?
  if (shouldKeep(parsedEvent)) {
    removeUnusedFields(parsedEvent);
    return true;
  }

  return false;
}

module.exports = fixParsedEvent;