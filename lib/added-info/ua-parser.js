const uaConst = require('./ua-constants'),
  userAgents = uaConst.userAgents;

function getBrowser(uaString) {
  "use strict";

  return Object.keys(userAgents).find((uaKey) => {
    const ua = userAgents[uaKey];
    return (uaString.includes(ua.text) || (ua.text2 && uaString.includes(ua.text2)));
  });
}

function getBrowserVersion(uaString, browserName) {
  "use strict";

  function getNumberAfterString(str) {
    const charIndex = uaString.indexOf(str);
    if (charIndex < 0) {
      throw new Error('Unexpected user agent string format -- can\'t find browser version');
    }
    return parseInt(uaString.substr(charIndex + str.length));
  }

  switch (userAgents[browserName]) {
    case userAgents.Firefox:
      return getNumberAfterString('rv:');
    case userAgents.Chrome:
      return getNumberAfterString('Chrome/');
    case userAgents.Safari:
      return getNumberAfterString('Version/');
    case userAgents.IE:
      return getNumberAfterString('MSIE ');
    case userAgents.Edge:
      return getNumberAfterString('Edge/');
    default:
      throw new Error('Unexpected user agent');
  }
}

function isUnsupportedBrowserVersion(version, browserName) {
  "use strict";

  let minVersion = userAgents[browserName].minVersion;

  if (!minVersion) {
    throw new Error('No min version');
  }

  return version < minVersion;
}

function isUnsupportedOS(uaString) {
  "use strict";

  return !uaString.includes('Windows NT') && !uaString.includes('Mac OS X');
}

function getUaInfo(parsedEvent) {
  "use strict";

  // Future: if we want faster results, we can use the parsed user agent info we've had since May 11, 2016 (4.0.72+)
  // if (parsedEvent.browser) {
  //   // Fast track
  //   return {
  //     browser: parsedEvent.browser,
  //     browserVersion: parsedEvent.browserVersion,
  //     os: parsedEvent.os,
  //     osVersion: parsedEvent.osVersion,
  //     isUnsupported: parsedEvent.isUnsupported
  //   }
  // }

  const result = {},
    uaString = parsedEvent.browserUserAgent || parsedEvent.browser_user_agent;

  result.browser = getBrowser(uaString);
  if (userAgents[result.browser].type.isUnsupported ||
    isUnsupportedOS(uaString)) {
    result.isUnsupported = true;
  }
  else {
    // Get and check browser version
    result.browserVersion = getBrowserVersion(uaString, result.browser);
    if (isUnsupportedBrowserVersion(result.browserVersion, result.browser)) {
      result.isUnsupported = true;
    }
  }

  // Check against what Sitecues said about browser info
  if (parsedEvent.browser) {
    // Event includes parsed browser info in later versions of Sitecues
    if (parsedEvent.isUnsupportedPlatform !== result.isUnsupported) {
      result.isInconsistencyFlagged = true;
    }
  }

  return result;
}


module.exports = getUaInfo;