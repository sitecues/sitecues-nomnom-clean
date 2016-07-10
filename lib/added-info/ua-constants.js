const userAgentTypes = {
  Bot: {
    isUnsupported: true
  },
  Mobile: {
    isUnsupported: true
  },
  UnsupportedDesktopOS: {
    isUnsupported: true
  },
  UnsupportedBrowser: {
    isUnsupported: true,
  },
  Supported: {
  }
};

const userAgents = {
  // Order matters here: we check user agent string for text as substring in this order
  GoogleBot: {
    text: 'Googlebot',
    text2: 'Google Bot',
    type: userAgentTypes.Bot
  },
  YandexBot: {
    text: 'YandexBot',
    type: userAgentTypes.Bot
  },
  BingPreview: {
    text: 'BingPreview',
    type: userAgentTypes.Bot
  },
  WinPhone: {
    text: 'Windows Phone',
    type: userAgentTypes.Mobile
  },
  Android: {
    text: 'Android',
    type: userAgentTypes.Mobile
  },
  iPad: {
    text: 'iPad',
    type: userAgentTypes.Mobile
  },
  iPhone: {
    text: 'iPhone',
    type: userAgentTypes.Mobile
  },
  CrOS: {
    text: 'CrOS',
    type: userAgentTypes.UnsupportedDesktopOS
  },
  Linux: {
    text: 'Linux',
    type: userAgentTypes.UnsupportedDesktopOS
  },
  Edge: {
    text: 'Edge/',
    type: userAgentTypes.Supported,
    minVersion: 13
  },
  // TODO what about Trident?
  IE: {
    text: 'MSIE ',
    type: userAgentTypes.Supported,
    minVersion: 11
  },
  Firefox: {
    text: 'Firefox/',
    type: userAgentTypes.Supported,
    minVersion: 34
  },
  Chrome: {
    text: 'Chrome/',
    type: userAgentTypes.Supported,
    minVersion: 41
  },
  Safari: {
    text: 'Safari/',
    type: userAgentTypes.Supported,
    minVersion: 8
  },
  Opera: {
    text: 'Opera',
    type: userAgentTypes.UnsupportedBrowser
  },
  Other: {
    text: '',
    type: userAgentTypes.UnsupportedBrowser
  }
};

module.exports = {
  userAgentTypes,
  userAgents
};