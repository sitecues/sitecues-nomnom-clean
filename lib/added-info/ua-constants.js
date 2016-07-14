const userAgentInfo = {
  Edge: {
    text: 'Edge/',
    minVersion: 13,
    versionPrefix: 'Edge/',
    win: true
  },
  IE: {
    text: 'MSIE ',
    text: 'Trident/',
    minVersion: 11,
    versionPrefix: 'MSIE ',
    versionPrefix2: 'rv:',
    win: true
  },
  Firefox: {
    text: 'Firefox/',
    minVersion: 34,
    versionPrefix: 'rv:',
    win: true,
    mac: true
  },
  Chrome: {
    text: 'Chrome/',
    minVersion: 41,
    versionPrefix: 'Chrome/',
    win: true,
    mac: true
  },
  Safari: {
    text: 'Safari/',
    minVersion: 8,
    versionPrefix: 'Version/',
    mac: true
  },
  Opera: {
    text: 'Opera',
    win: true,
    mac: true
  },

  // Order matters here: we check user agent string for text as substring in this order
  _GoogleBot: {
    text: 'Googlebot',
    text2: 'Google Bot'
  },
  _YandexBot: {
    text: 'YandexBot'
  },
  _BingPreview: {
    text: 'BingPreview'
  },
  _WinPhone: {
    text: 'Windows Phone'
  },
  _Android: {
    text: 'Android'
  },
  _iPad: {
    text: 'iPad'
  },
  _iPhone: {
    text: 'iPhone'
  },
  _ChromeOS: {
    text: 'CrOS'
  },
  _Linux: {
    text: 'Linux'
  },
  _OtherOS: {
    text: ''
  },
  OtherBrowser: {
    text: '',
    win: true,
    mac: true
  }
};

module.exports = {
  userAgentInfo
};