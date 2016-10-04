'use strict';

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
  return possibleUserAgents.find((uaName) => {
    const uaInfo = userAgentTypes[uaName],
      textArray = typeof uaInfo.text === 'string' ? [ uaInfo.text ] : uaInfo.text;
    return textArray.some((text) => uaString.includes(text));
  });
}

// os === 'win'|'mac'
function getUserAgents(os) {
  return allUserAgentNames.filter((uaName) => userAgentTypes[uaName][os]);
}

function getRejectedOSUserAgents() {
  function hasNoSupportedOS(uaName) {
    const uaInfo = userAgentTypes[uaName];
    return !uaInfo.win && !uaInfo.mac;
  }

  return allUserAgentNames.filter(hasNoSupportedOS);
}

// Versions before 4.0.72 are consider 'old' and supported IE9/10, etc.
function isOldSitecues(sitecuesVersion) {
  if (!sitecuesVersion) {
    return true;
  }
  const majorMinorVersion = parseFloat(sitecuesVersion);
  if (majorMinorVersion < 4) {
    return true;
  }
  if (majorMinorVersion > 4) {
    return false;
  }

  const pointRelease = parseInt(sitecuesVersion.split('4.0.')[1]);
  return pointRelease < 72;
}

function getUaInfo(parsedEvent) {
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

  // Get all identifiers for browsers and groups
  function getAllIds(isUnsupported, browser, os) {
    const groups = ([
      isUnsupported ? '@unsupported' : '@supported'
    ]);

    if ((browser !== 'Chrome' && browser !== 'Firefox') || !os) {
      // Not Chrome or Firefox
      // Or not Win/Mac
      return groups;
    }

    // For platform comparisons, we use only browsers that are shipped on both Windows and Mac,
    // namely Chrome and Firefox
    // This adds @firefox-or-chrome-on-win or @firefox-or-chrome-on-mac
    return groups.concat('@x' + os);
  }

  function getMinVersion(parsedEvent, browser, browserInfo) {
    const doSupportOldBrowsers = isOldSitecues(parsedEvent.scVersion);
    // Special case check -- nothing elegant here for now
    if (browser === 'Safari' && parsedEvent.metricVersion > 20) {
      return 9;  // Stopped supporting Safari 8 at metric version 20
    }
    return doSupportOldBrowsers ? browserInfo.oldMinVersion : browserInfo.minVersion;
  }

  // return 0 if unknown
  function getBrowserVersion() {
    function getNumberAfterString(str) {
      if (str) {
        const charIndex = uaString.indexOf(str);
        return parseInt(uaString.substr(charIndex + str.length)) || 0;
      }
    }

    return getNumberAfterString(userAgentTypes[browser].versionPrefix) ||
      getNumberAfterString(userAgentTypes[browser].versionPrefix2);

  }

  const uaString = parsedEvent.browserUserAgent;

  let isUnsupportedOs = false,
    possibleUserAgents,
    os;

  if (uaString.startsWith(PREFIX)) {
    const osPart = uaString.substring(OS_OFFSET);
    if (osPart.includes(QUICK_CHECK_WIN)) {
      possibleUserAgents = winUserAgentNames
      os = 'win';
    }
    else if (osPart.includes(QUICK_CHECK_OSX)) {
      possibleUserAgents = macUserAgentNames
      os = 'mac';
    }
  }

  if (!possibleUserAgents) {
    isUnsupportedOs = true;
    possibleUserAgents = rejectedOSUserAgentNames;
  }

  const
    browser = getMatchingUserAgent(uaString, possibleUserAgents),
    browserInfo = userAgentTypes[browser],
    minVersion = getMinVersion(parsedEvent, browser, browserInfo),
    browserVersion = minVersion ? getBrowserVersion(uaString, browser) : undefined,
    isUnsupportedBrowser = browserVersion < minVersion,
    isUnsupported = isUnsupportedOs || !browserVersion || isUnsupportedBrowser || undefined,
    // Check against what Sitecues said about browser info
    isInconsistent = parsedEvent.details && parsedEvent.details.browser && parsedEvent.isUnsupportedPlatform !== isUnsupported,
    ids = getAllIds(isUnsupported, browser, os)
      .concat(browser).concat('@any');

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
    ids
  };
}

module.exports = getUaInfo;