// Get metadata for event

const
  shortenedDomain = require('./shortened-domain'),
  userAgentParser = require('./ua-parser'),
  pseudoEventGenerator = require('./pseudo-events'),
  locationParser = require('./locations');

function getMetaData(parsedEvent) {
  const domain = shortenedDomain(parsedEvent),
    ua = userAgentParser(parsedEvent),
    events = [ parsedEvent.name ].concat(pseudoEventGenerator(parsedEvent, ua) || []  ),
    locations = locationParser(parsedEvent, domain);

  return {
    domain,
    ua,
    events,
    locations
  };
}

module.exports = getMetaData;