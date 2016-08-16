'use strict';

const userAgentInfo = {
  Edge: {
    text: 'Edge/',
    minVersion: 13,
    oldMinVersion: 12,
    versionPrefix: 'Edge/',
    win: true,
    group: '@desktop'
  },
  IE: {
    text: [ 'MSIE ', 'Trident/' ],
    minVersion: 11,
    oldMinVersion: 9,
    versionPrefix: 'MSIE ',
    versionPrefix2: 'rv:',
    win: true,
    group: '@desktop'
  },
  Firefox: {
    text: 'Firefox/',
    minVersion: 34,
    oldMinVersion: 1,
    versionPrefix: 'rv:',
    win: true,
    mac: true,
    group: '@desktop'
  },
  Chrome: {
    text: 'Chrome/',
    minVersion: 41,
    oldMinVersion: 1,
    versionPrefix: 'Chrome/',
    win: true,
    mac: true,
    group: '@desktop'
  },
  Safari: {
    text: 'Safari/',
    minVersion: 8,
    oldMinVersion: 1,
    versionPrefix: 'Version/',
    mac: true,
    group: '@desktop'
  },
  Opera: {
    text: 'Opera',
    win: true,
    mac: true,
    group: '@desktop'
  },

  // Order matters here: we check user agent string for text as substring in this order
  _bot: {
    text: [ 'Googlebot', 'Google Bot', 'YandexBot', 'BingPreview' ],
    group: '@bot'
  },
  _WinPhone: {
    text: 'Windows Phone',
    group: '@mobile'
  },
  _Android: {
    text: 'Android',
    group: '@mobile'
  },
  _iPad: {
    text: 'iPad',
    group: '@mobile'
  },
  _iPhone: {
    text: 'iPhone',
    group: '@mobile'
  },
  _ChromeOS: {
    text: 'CrOS',
    group: '@desktop'
  },
  _Linux: {
    text: 'Linux',
    group: '@desktop'
  },
  _OtherOS: {
    text: '',
    group: '@unknown-os'
  },
  OtherBrowser: {
    text: '',
    win: true,
    mac: true,
    group: '@unknown-browser'
  }
};

module.exports = userAgentInfo;
