// In order to save space (and JSON processing time), we remove unused fields
function removeUnusedFields(parsedEvent) {
  delete parsedEvent.browserUserAgent;
  delete parsedEvent.scVersion;
  delete parsedEvent.metricVersion;
  delete parsedEvent.pageUrl;
}

module.exports = removeUnusedFields;