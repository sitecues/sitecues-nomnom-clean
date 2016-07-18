'use strict';

// Fix incorrectly reported data in an event
// TODO solve mystery: why does EEOC site id have so many weird pageUrls
// TODO repair missing site ids when we can figure it out?
const EXTENSION_IDS = new Set(['#s-70b96e72', '#s-1596260c', '#s-482d53c7']),
  TEST_IDS = new Set(['#s-1f9c2da4']),
  IP_ADDRESS_REGEX = /^https?:\/\/\d/,
  LOCALHOST_REGEX = /^https?:\/\/localhost/,
  PROXY_URL_REGEX =/^https?:\/\/proxy\./,
  HELP_SCREEN_REGEX = /^https?:\/\/js\.sitecues\.com\//,
  DEPRECATED_FIELDNAMES = {
    'metricsVersion': 'metricVersion',
  },
  UNKNOWN_SITE_ID = '#s-????????';

function convertField(obj, oldName, newName) {
  obj[newName] = obj[oldName];
  delete obj[oldName];
}

function convertToCamelCase(obj) {
  function camelize(str) {
    return str.replace(/_[a-z]/g, function (str, index) {
      return str.charAt(1).toUpperCase();
    });
  }

  // Fix all _ names first (convert to camelcase)
  for (let fieldName in obj) {
    if (obj.hasOwnProperty(fieldName)) {
      if (fieldName.includes('_')) {
        convertField(obj, fieldName, camelize(fieldName));
      }
    }
  }
}

function correctOldFieldNames(obj, deprecatedFieldNamesMap) {
  for (let deprecatedName in deprecatedFieldNamesMap) {
    if (obj.hasOwnProperty(deprecatedName)) {
      const newName = deprecatedFieldNamesMap[deprecatedName];
      convertField(obj, deprecatedName, newName);
    }
  }
}

function fixParsedEvent(parsedEvent) {

  if (parsedEvent.client_time_ms) {
    convertToCamelCase(parsedEvent);
    if (parsedEvent.details) {
      convertToCamelCase(parsedEvent.details);
    }
  }
  correctOldFieldNames(parsedEvent, DEPRECATED_FIELDNAMES);

  if (!parsedEvent.pageUrl) {
    console.log('** Error, no page url: ' + JSON.stringify(parsedEvent));
    parsedEvent.doIgnore = true;
    return;
  }

  // trim() the site id because one siteId has a space in it
  parsedEvent.siteId = parsedEvent.siteId ? '#' + parsedEvent.siteId.trim(): UNKNOWN_SITE_ID;

  if (parsedEvent.siteId === UNKNOWN_SITE_ID) {
    if (parsedEvent.scVersion && parseInt(parseInt.scVersion) >= 4) {
      console.log('** Error, no site id for %s / %s / v%s', parsedEvent.name, parsedEvent.pageUrl, parsedEvent.scVersion);
    }
    else {
      // Older Sitecues seems to sometimes hate site ids
    }
  }

  if (parsedEvent.name === 'panel-clicked') {
    fixPanelClickedTarget(parsedEvent);
  }
  else if (parsedEvent.name === 'feedback-send') {
    parsedEvent.name = 'feedback-sent';
  }
  else if (parsedEvent.name === 'zoom-changed') {

  }

  if (parsedEvent.siteId === '#s-00000005' ||
      parsedEvent.source === 'reverse-proxy' ||
      parsedEvent.source === 'forward-proxy' ||
      parsedEvent.pageUrl.startsWith('file:') ||
      parsedEvent.pageUrl.match(IP_ADDRESS_REGEX) ||
      parsedEvent.pageUrl.match(LOCALHOST_REGEX) ||
      parsedEvent.pageUrl.match(PROXY_URL_REGEX)) {
    // File protocol and ip addresses are a sign of a tester
    parsedEvent.isTester = true;
    parsedEvent.doIgnore = true;
    if (!fixParsedEvent.isPooMasterUnmasked && parsedEvent.pageUrl.includes('poo_master')) {
      fixParsedEvent.isPooMasterUnmasked = true;
      console.log('The Poo Master ... has been unmasked ... as ' + parsedEvent.siteId + ' !!!');
    }
  }
  else if (parsedEvent.source ? parsedEvent.source === 'extension' : EXTENSION_IDS.has(parsedEvent.siteId)) {
    parsedEvent.source = 'extension';
    parsedEvent.doIgnore = true;
  }
  else if (TEST_IDS.has(parsedEvent.siteId)) {
    parsedEvent.doIgnore = true;
  }
  else if (parsedEvent.pageUrl.match(HELP_SCREEN_REGEX)) {
    parsedEvent.doIgnore = true; // Sitecues help screen
  }

  return parsedEvent;
}

function fixPanelClickedTarget(parsedEvent) {

  if (parsedEvent.metricVersion >= 8) {
    parsedEvent.details.target = parsedEvent.details.target.split('scp-')[1];
    return; // panel-clicked targets are fine starting with v9, but remove scp- prefix for readability
  }

  const target = parsedEvent.details.target;

  const MAPPED_TARGETS = {
    // Use a relevant ancestor of these targets that have role="presentation"
    'logo-text': 'about',
    'sitecues-text': 'about',
    'secondary-outline': 'secondary',
  },
  VALID_TARGETS = new Set([
    'secondary',
    'bottom-secondary',
    'tips-label',
    'settings-label',
    'feedback-label',
    'about-label',
    'card-header-bg',
    'arrows',
    'prev-card',
    'next-card',
    'feedback',
    'feedback-input-rect',
    'rating',
    'stars-1',
    'stars-2',
    'stars-3',
    'stars-4',
    'stars-5',
    'about',
    'button-menu',
    'tips-button',
    'settings-button',
    'feedback-button',
    'about-button',
    'feedback-header',
    'feedback-prompt',
    'feedback-textarea',
    'feedback-send-button',
    'feedback-thanks',
    'about-preamble',
    'about-sitecues-link',
    'about-rate-footer',
    'rate-us-suggest',
    'about-rate-button',
    'settings',
    'theme-settings',
    'theme-power-group',
    'theme-power',
    'theme-power-label',
    'theme-text-hue-group',
    'theme-text-hue',
    'theme-text-hue-label',
    'mouse-settings',
    'mouse-settings-group',
    'mouse-size',
    'mouse-size-label',
    'mouse-hue',
    'mouse-hue-label',
    'theme-settings-tab',
    'mouse-settings-tab',
    'tips',
    'zoom-card',
    'use-slider-heading',
    'demo-slider',
    'demo-slider-bar',
    'demo-slider-thumb',
    'zoom-keys-card',
    'demo-zoom-minus',
    'demo-zoom-plus',
    'highlight-card',
    'tabbable',
    'lens-card',
    'demo-lens-spacebar',
    'speech-card',
    'speech-button-demo',
    'demo-speech-spacebar',
    'full-guide-card',
    'guide-icon',
    'guide-label',
    'kbd-icon',
    'kbd-label',
    'zoom-tab',
    'highlight-tab',
    'lens-tab',
    'speech-tab',
    'full-guide-tab',
    'demo-page',
    'demo-page-contents',
    'demo-para',
    'demo-mouse'
  ]);

  if (MAPPED_TARGETS[target]) {
    // Use a relevant ancestor of these targets that have role="presentation"
    parsedEvent.details.target = MAPPED_TARGETS[target];
  }
  else if (VALID_TARGETS.has(target)) {
    // Expected click target
    parsedEvent.details.target = target;
  }
  else {
    // panel-click target not one of expected ids (e.g in page) -- ignore
    parsedEvent.doIgnore = true;
  }
}

module.exports = fixParsedEvent;