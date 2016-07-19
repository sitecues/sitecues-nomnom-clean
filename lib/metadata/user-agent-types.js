'use strict';

const userAgentInfo = {
  Edge: {
    text: 'Edge/',
    minVersion: 13,
    oldMinVersion: 12,
    versionPrefix: 'Edge/',
    win: true,
    groups: '@desktop'
  },
  IE: {
    text: 'MSIE ',
    text2: 'Trident/',
    minVersion: 11,
    oldMinVersion: 9,
    versionPrefix: 'MSIE ',
    versionPrefix2: 'rv:',
    win: true,
    groups: '@desktop'
  },
  Firefox: {
    text: 'Firefox/',
    minVersion: 34,
    oldMinVersion: 1,
    versionPrefix: 'rv:',
    win: true,
    mac: true,
    groups: '@desktop'
  },
  Chrome: {
    text: 'Chrome/',
    minVersion: 41,
    oldMinVersion: 1,
    versionPrefix: 'Chrome/',
    win: true,
    mac: true,
    groups: '@desktop'
  },
  Safari: {
    text: 'Safari/',
    minVersion: 8,
    oldMinVersion: 1,
    versionPrefix: 'Version/',
    mac: true,
    groups: '@desktop'
  },
  Opera: {
    text: 'Opera',
    win: true,
    mac: true,
    groups: '@desktop'
  },

  // Order matters here: we check user agent string for text as substring in this order
  _GoogleBot: {
    text: 'Googlebot',
    text2: 'Google Bot',
    groups: '@bots'
  },
  _YandexBot: {
    text: 'YandexBot',
    groups: '@bots'
  },
  _BingPreview: {
    text: 'BingPreview',
    groups: '@bots'
  },
  _WinPhone: {
    text: 'Windows Phone',
    groups: '@mobile'
  },
  _Android: {
    text: 'Android',
    groups: '@mobile'
  },
  _iPad: {
    text: 'iPad',
    groups: '@mobile'
  },
  _iPhone: {
    text: 'iPhone',
    groups: '@mobile'
  },
  _ChromeOS: {
    text: 'CrOS',
    groups: '@desktop'
  },
  _Linux: {
    text: 'Linux',
    groups: '@desktop'
  },
  _OtherOS: {
    text: '',
    groups: '@unknown-os'
  },
  OtherBrowser: {
    text: '',
    win: true,
    mac: true,
    groups: '@unknown-browser'
  }
};

module.exports = userAgentInfo;
