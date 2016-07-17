// Create pseudo-events:
// 'zoom-user'
// 'speech-user'

const pseudoEventsFn = {
  'page-visited': getPageVisitPseudoEvents,
  'tts-requested': getTtsPseudoEvents,
  'zoom-changed': getZoomChangedPseudoEvents,
  'feedback-sent': getStarRatingPseudoEvents,
  'panel-clicked': getPanelClickedPseudoEvents
},
  SUPPORTED_LANGS = new Set(['en', 'de', 'es', 'fr', 'se', 'pl']);

function getPageVisitPseudoEvents(event) {
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

  // We no longer use this -- instead we use the user agent groups @supported, @unsupported
  // pseudoEvents.push(event.metadata.ua.isUnsupported ? 'unsupported' : 'supported');

  if (event.metadata.ua.isInconsistent) {
    pseudoEvents.push('supported-inconsistency');
  }

  const source = event.source;
  if (source) {
    pseudoEvents.push('source-' + source);
  }

  const locale = event.clientLanguage,
    VALID_LOCALE_REGEX = /^[a-z]{2,3}(?:-[A-Z]{2,3}(?:-[a-zA-Z]{4})?)?$/;

  if (locale) {
    if (locale.match(VALID_LOCALE_REGEX)) {
      const lang = locale.split('-')[0],
        isLangSupported = SUPPORTED_LANGS.has(lang);
      if (isLangSupported) {
        pseudoEvents.push('locale-' + locale);
      }
      else {
        pseudoEvents.push('lang-unsupported' + lang);
        pseudoEvents.push('lang-unsupported::' + lang);
      }
    }
  }
  else {
    pseudoEvents.push('locale-invalid');
  }

  return pseudoEvents;
}

// Create pseudo-events:
// 'speech-trigger-selection'
// 'speech-trigger-shift'
// 'speech-trigger-space'
function getTtsPseudoEvents(event) {
  "use strict";

  const details = event.details;
  if (details) {
    return ['via-' + event.details.trigger]; // There will always be a trigger
  }
}

function getZoomChangedPseudoEvents(event) {
  "use strict";
  const pseudoEvents = [],
    details = event.details;
  if (!details) {
    return;
  }
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
    pseudoEvents.push('details-empty');
  }

  return pseudoEvents;
}

function getStarRatingPseudoEvents(event) {
  "use strict";
  var numStars = event.details.rating;

  if (!numStars) {
    return [ 'no-stars-given' ];
  }

  // By returning 'star-given' for each, star, this allows the graphing viewer to be used
  // to see the average rating over time, by using the ratio of stars-given to star-given
  return [ 'stars-given' ].concat(Array(numStars).fill('one-star-given'));
}

function getPanelClickedPseudoEvents(event) {
  "use strict";
  return [ event.details.target ];
}

// Return additional pseudo events that occurred based on event data or falsey if none
function getPseudoEvents(event) {
  "use strict";

  const pseudoEventsGetterFn = pseudoEventsFn[event.name];
  if (pseudoEventsGetterFn) {
    let pseudoEvents = pseudoEventsGetterFn(event);
    if (pseudoEvents && pseudoEvents.length) {
      // Create name like page-visited::supported
      return pseudoEvents.map((pseudoEventName) => event.name + '::' + pseudoEventName);
    }
  }
}

module.exports = getPseudoEvents;