'use strict';

function repairPanelClickedTarget(parsedEvent) {

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
      'settings-label': 'settings',
      'settings-button': 'settings',
      'tips-label': 'tips',
      'tips-button': 'tips',
      'feedback-label': 'feedback',
      'feedback-button': 'feedback',
      'about-label': 'about',
      'about-button': 'about'
    },
    VALID_TARGETS = new Set([
      'secondary',
      'bottom-secondary',
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

module.exports = repairPanelClickedTarget;