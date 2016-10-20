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

let tooOldCounter = 0,
  dateIndexDiscrepencyCounter = 0;

function repairFeedbackSendName(parsedEvent) {
  parsedEvent.name = 'feedback-sent';
}

function getDateAsNumber(date) {
  return date.year * 10000 + date.month * 100 + date.day;
}

// Return true for events we want to keep, false to ignore
function fixParsedEvent(parsedEvent, backupSiteId, serverTs, eventId, dateMap, fileDateIndex) {
  // Field names
  repairFieldNames(parsedEvent);

  // Check that basic info is available
  if (!parsedEvent.pageUrl ||
    !parsedEvent.browserUserAgent) { // Almost never happens
    // console.log('No page url or new user agent');
    // console.log(parsedEvent.name);
    return false;
  }

  // Date and index
  // Get the year, month and date from the server ts rather than the file, because there can be a discrepancy
  const date = new Date(serverTs);
  parsedEvent.date = {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
  const dateAsNum = getDateAsNumber(parsedEvent.date),
    newDateIndex = dateMap[dateAsNum];
  parsedEvent.dateIndex = newDateIndex;
  if (typeof newDateIndex !== 'number') {
    if (dateAsNum === 20160131) {
      console.log('Event before beginning of time (Feb 1, 2016) -- throwing away: ', ++ tooOldCounter);
      return false;
    }
    console.log('Bad date: ' + newDateIndex + ' from ' + dateAsNum + ' / ' + JSON.stringify(parsedEvent.date));
    return false;
  }
  if (newDateIndex !== fileDateIndex) {
    if (newDateIndex < fileDateIndex - 1 || newDateIndex > fileDateIndex + 1) {
      console.log('Strange date index discrepency, off by more than 1 day: ' + fileDateIndex + ' => ' + newDateIndex);
    }
    else {
      console.log('Date index discrepency for dateIndex = %d (%s): ',
        dateAsNum,
        newDateIndex > fileDateIndex ? '+1' : '-1',
        ++ dateIndexDiscrepencyCounter);
    }
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
  }
  else if (typeof parsedEvent.abTest !== 'undefined') {
    delete parsedEvent.abTest;
  }

  // Event-specific fixes
  const eventSpecificRepairFn = eventSpecificRepair[parsedEvent.name];
  if (eventSpecificRepairFn) {
    eventSpecificRepairFn(parsedEvent);
  }

  // Version
  const version = parsedEvent.scVersion,
    simplifiedVersionString = version && version.replace('-RELEASE', '');
  parsedEvent.version = simplifiedVersionString;

  // Metadata
  parsedEvent.meta = metaData(parsedEvent);

  // Garbage session id fix
  if (parsedEvent.userId && (simplifiedVersionString === '4.2.7' || simplifiedVersionString === '4.2.8')) {
    // Create a session ID unique to this user and this domain
    const newSessionId = parsedEvent.userId + '-' + parsedEvent.meta.domain + '-' + newDateIndex;
    parsedEvent.sessionId = newSessionId;
  }
  // TODO Debug null session ids and page view ids!
  // else {
  //   if (!parsedEvent.sessionId && parsedEvent.name !== 'page-visited' && parsedEvent.name !== 'error') {
  //     console.log(JSON.stringify(parsedEvent));
  //   }
  // }

  // Keep or ignore?
  if (shouldKeep(parsedEvent)) {
    removeUnusedFields(parsedEvent);
    return true;
  }

  return false;
}

module.exports = fixParsedEvent;