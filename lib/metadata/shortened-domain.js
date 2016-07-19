'use strict';

const url = require('url');

function getShortenedDomain(parsedEvent) {
  const pageUrl = parsedEvent.pageUrl;
  if (!pageUrl) {
    return '@unknown';
  }

  const hostname = url.parse(pageUrl).hostname;

  let parts = hostname.split('.');

  if (parts[0].startsWith('www')) {
    parts = parts.slice(1);
  }

  let result = parts.join('.');
  if (result.endsWith('.')) {
    result = result.slice(0, -1); // eeoc.gov. and amacusg.org. have extra periods!
  }
  return result;
}

module.exports = getShortenedDomain;
