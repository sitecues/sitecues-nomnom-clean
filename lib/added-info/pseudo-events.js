// Create pseudo-events:
// 'zoom-user'
// 'speech-user'
function getPageVisitTypes(event) {
  "use strict";

  const isZoomOn = event.zoomLevel > 1,
    isSpeechOn = event.ttsState,
    pseudoEvents = [];

  if (isZoomOn) {
    pseudoEvents.push('zoom-user');
  }

  if (isSpeechOn) {
    pseudoEvents.push('speech-user');
  }

  return pseudoEvents.length ? pseudoEvents : null;
}

// Create pseudo-events:
// 'speech-trigger-selection'
// 'speech-trigger-shift'
// 'speech-trigger-space'
function getTtsTriggerEvent(event) {
  "use strict";
  return [ 'via-' + event.details.trigger ]; // There will always be a trigger
}

function getZoomChangedTypes(event) {
  "use strict";
  const pseudoEvents = [],
    details = event.details;
  if (details.isSlider) {
    pseudoEvents.push(details.isSliderClick ? 'via-slider-click' : 'via-slider-drag');
  }
  else if (details.isCtrlWheel) {
    pseudoEvents.push('via-wheel');
  }
  else if (details.isUnpinch) {
    pseudoEvents.push('via-unpinch');
  }
  else if (details.isButtonPress) {
    pseudoEvents.push('via-a-button');
    pseudoEvents.push('glide-' + details.isLongGlide);
  }
  else if (details.isKey) {
    pseudoEvents.push('via-key');
    pseudoEvents.push('glide-' + details.isLongGlide);
    pseudoEvents.push('stolen-browser-key-' + details.isBrowserKeyOverride);
  }
  else {
    pseudoEvents.push('zoom-details-empty');
  }

  return pseudoEvents.length ? pseudoEvents : null;
}

// Return additional pseudo events that occurred based on event data or falsey if none
function getPseudoEvents(event) {
  "use strict";

  switch (event.name) {
    case 'page-visited':
      return getPageVisitTypes(event)
    case 'tts-requested':
      return getTtsTriggerEvent(event);
    case 'zoom-changed':
      return getZoomChangedTypes(event);
  }
}

module.exports = getPseudoEvents;
