const uaConst = require('./ua-constants'),
  userAgentInfo = uaConst.userAgentInfo,
  allUserAgentNames = Object.keys(userAgentInfo),
  winUserAgentNames = getUserAgents('win'),
  macUserAgentNames = getUserAgents('mac'),
  rejectedOSUserAgentNames = getRejectedOSUserAgents(),
  allUaStrings = {},
  PREFIX = 'Mozilla/5.0 (',
  OS_OFFSET = PREFIX.length,
  QUICK_CHECK_OSX = 'Macintosh; Intel Mac OS X',
  QUICK_CHECK_WIN = 'Windows NT';

function getMatchingUserAgent(uaString, possibleUserAgents) {
  "use strict";

  return possibleUserAgents.find((uaName) => {
    const uaInfo = userAgentInfo[uaName];
    return (uaString.includes(uaInfo.text) || (uaInfo.text2 && uaString.includes(uaInfo.text2)));
  });
}

// os === 'win'|'mac'
function getUserAgents(os) {
  "use strict";
  return allUserAgentNames.filter((uaName) => userAgentInfo[uaName][os]);
}

function getRejectedOSUserAgents() {
  "use strict";

  function hasNoSupportedOS(uaName) {
    const uaInfo = userAgentInfo[uaName];
    return !uaInfo.win && !uaInfo.mac;
  }

  return allUserAgentNames.filter(hasNoSupportedOS);
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

  function getBrowserVersion() {
    "use strict";

    function getNumberAfterString(str) {
      const charIndex = uaString.indexOf(str);
      if (charIndex < 0) {
        return 0;
        // throw new Error('Unexpected user agent string format -- can\'t find browser version for ' + browser + ':\n' + uaString);
      }
      return parseInt(uaString.substr(charIndex + str.length));
    }

    return getNumberAfterString(userAgentInfo[browser].versionPrefix);
  }

  const uaString = parsedEvent.browserUserAgent || parsedEvent.browser_user_agent;

  let isUnsupportedOs = false,
    possibleUserAgents;

  if (uaString.startsWith(PREFIX)) {
    const osPart = uaString.substring(OS_OFFSET);
    if (osPart.startsWith(QUICK_CHECK_WIN)) {
      possibleUserAgents = winUserAgentNames
    }
    else if (osPart.startsWith(QUICK_CHECK_OSX)) {
      possibleUserAgents = macUserAgentNames
    }
  }

  if (!possibleUserAgents) {
    isUnsupportedOs = true;
    possibleUserAgents = rejectedOSUserAgentNames;
  }

  const
    browser = getMatchingUserAgent(uaString, possibleUserAgents),
    browserInfo = userAgentInfo[browser],
    minVersion = browserInfo.minVersion,
    browserVersion = minVersion ? getBrowserVersion(uaString, browser) : undefined,
    isUnsupported = isUnsupportedOs || !browserVersion || browserVersion < minVersion || undefined,
    // Check against what Sitecues said about browser info
    isInconsistent = parsedEvent.browser && parsedEvent.isUnsupportedPlatform !== isUnsupported;

  // Debugging
  // if (!allUaStrings[usefulPart]) {
  //   console.log(usefulPart);
  //   allUaStrings[usefulPart] = 1;
  // }

  return {
    browser,
    browserVersion,
    isUnsupported,
    isInconsistent
  };
}

module.exports = getUaInfo;