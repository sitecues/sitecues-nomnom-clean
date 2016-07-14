// For convenience and readability, we will track events under
// a shortened domain, such as texasat.net rather than www.texasat.net

const url = require('url');

function getShortenedDomain(parsedEvent) {
  "use strict";
  const pageUrl = parsedEvent.pageUrl || parsedEvent.page_url;
  if (!pageUrl) {
    return 'unknown';
  }

  const hostname = url.parse(pageUrl).hostname;

  let parts = hostname.split('.');

  if (parts[0].startsWith('www')) {
    parts = parts.slice(1);
  }
  return parts.join('.');
}

module.exports = getShortenedDomain;