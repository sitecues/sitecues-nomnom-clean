const userAgentInfo = {
  Edge: {
    text: 'Edge/',
    minVersion: 13,
    versionPrefix: 'Edge/',
    win: true,
    groups: '@desktop'
  },
  IE: {
    text: 'MSIE ',
    text: 'Trident/',
    minVersion: 11,
    versionPrefix: 'MSIE ',
    versionPrefix2: 'rv:',
    win: true,
    groups: '@desktop'
  },
  Firefox: {
    text: 'Firefox/',
    minVersion: 34,
    versionPrefix: 'rv:',
    win: true,
    mac: true,
    groups: '@desktop'
  },
  Chrome: {
    text: 'Chrome/',
    minVersion: 41,
    versionPrefix: 'Chrome/',
    win: true,
    mac: true,
    groups: '@desktop'
  },
  Safari: {
    text: 'Safari/',
    minVersion: 8,
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
    groups: '@unknown'
  },
  OtherBrowser: {
    text: '',
    win: true,
    mac: true,
    groups: '@unknown'
  }
};

module.exports = {
  userAgentInfo
};