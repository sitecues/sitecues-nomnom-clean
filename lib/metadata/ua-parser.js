const userAgentTypes = require('./user-agent-types'),
  allUserAgentNames = Object.keys(userAgentTypes),
  rejectedOSUserAgentNames = getRejectedOSUserAgents(),
  winUserAgentNames = allUserAgentNames,
  macUserAgentNames = getUserAgents('mac'),
  PREFIX = 'Mozilla/5.0 (',
  OS_OFFSET = PREFIX.length,
  QUICK_CHECK_OSX = 'Macintosh; Intel Mac OS X',
  QUICK_CHECK_WIN = 'Windows NT';

function getMatchingUserAgent(uaString, possibleUserAgents) {
  "use strict";

  return possibleUserAgents.find((uaName) => {
    const uaInfo = userAgentTypes[uaName];
    return (uaString.includes(uaInfo.text) || (uaInfo.text2 && uaString.includes(uaInfo.text2)));
  });
}

// os === 'win'|'mac'
function getUserAgents(os) {
  "use strict";
  return allUserAgentNames.filter((uaName) => userAgentTypes[uaName][os]);
}

function getRejectedOSUserAgents() {
  "use strict";

  function hasNoSupportedOS(uaName) {
    const uaInfo = userAgentTypes[uaName];
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

  // return 0 if unknown
  function getBrowserVersion() {
    "use strict";

    function getNumberAfterString(str) {
      if (str) {
        const charIndex = uaString.indexOf(str);
        return parseInt(uaString.substr(charIndex + str.length)) || 0;
      }
    }

    return getNumberAfterString(userAgentTypes[browser].versionPrefix) ||
      getNumberAfterString(userAgentTypes[browser].versionPrefix2);

  }

  const uaString = parsedEvent.browserUserAgent || parsedEvent.browser_user_agent;

  if (!uaString) {
    return {
      browser: '@missing',
      isUnsupported: true,
      groups: [ '@any', '@unsupported', '@unknown' ]
    };
  }

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
    browserInfo = userAgentTypes[browser],
    minVersion = browserInfo.minVersion,
    browserVersion = minVersion ? getBrowserVersion(uaString, browser) : undefined,
    isUnsupported = isUnsupportedOs || !browserVersion || browserVersion < minVersion || undefined,
    // Check against what Sitecues said about browser info
    isInconsistent = parsedEvent.browser && parsedEvent.isUnsupportedPlatform !== isUnsupported,
    groups = [ '@any', isUnsupported ? '@unsupported' : '@supported' ].concat(browserInfo.groups);

  

  // Debugging
  // if (!allUaStrings[usefulPart]) {
  //   console.log(usefulPart);
  //   allUaStrings[usefulPart] = 1;
  // }

  return {
    browser,
    browserVersion,
    isUnsupported,
    isInconsistent,
    groups
  };
}

module.exports = getUaInfo;