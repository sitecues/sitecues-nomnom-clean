const userAgentParser = require('../metadata/ua-parser'),
  pseudoEventGenerator = require('../metadata/pseudo-events'),
  locations = require('../metadata/locations');

function addMetaData(parsedEvent) {
  if (!parsedEvent.metadata.ua) {
    parsedEvent.metadata.ua = userAgentParser(parsedEvent);
  }

  if (!parsedEvent.metadata.pseudoEvents) {
    parsedEvent.metadata.pseudoEvents = pseudoEventGenerator(parsedEvent);
  }

  if (!parsedEvent.metadata.locations) {
    parsedEvent.metadata.locations = locations(parsedEvent);
  }
}

module.exports = addMetaData;