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
function fixParsedEvent(parsedEvent, backupSiteId, serverTs, eventId) {
  // Field names
  repairFieldNames(parsedEvent);

  // Check that basic info is available
  if (!parsedEvent.pageUrl ||
    !parsedEvent.browserUserAgent) { // Almost never happens
    // console.log('No page url or new user agent');
    // console.log(parsedEvent.name);
    return false;
  }

  // Event ID
  parsedEvent.eventId = eventId;

  // Site ID
  parsedEvent.siteId = (parsedEvent.siteId || backupSiteId).trim();

  // Server time
  parsedEvent.serverTs = serverTs;

  // Window name simplification -- sometimes the names are ridiculously large
  if (parsedEvent.details && parsedEvent.details.windowName) {
    parsedEvent.details.windowName = parsedEvent.details.windowName.substr(0, 30);
  }

  // Garbage AB test check
  if (typeof parsedEvent.abTest === 'string') {
    if (parsedEvent.abTest.startsWith('moreButtonTimer.')) {
      delete parsedEvent.abTest;
    }
    else if (parsedEvent.abTest.startsWith('moreButtonTimer')) {
      console.log(parsedEvent.abTest);
    }
  }
  else if (typeof parsedEvent.abTest !== 'undefined') {
    delete parsedEvent.abTest;
  }

  // Event-specific fixes
  const eventSpecificRepairFn = eventSpecificRepair[parsedEvent.name];
  if (eventSpecificRepairFn) {
    eventSpecificRepairFn(parsedEvent);
  }

  // Metadata
  parsedEvent.meta = metaData(parsedEvent);

  // Garbage session id fix
  if (parsedEvent.scVersion === '4.2.7' || parsedEvent.scVersion === '4.2.8') {
    // Create a session ID unique to this user and this domain
    parsedEvent.sessionId = parsedEvent.userId + '|' + parsedEvent.meta.domain;
  }

  // Keep or ignore?
  if (shouldKeep(parsedEvent)) {

    removeUnusedFields(parsedEvent);
    return true;
  }

  return false;
}

module.exports = fixParsedEvent;