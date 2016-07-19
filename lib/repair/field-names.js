'use strict';

const DEPRECATED_FIELDNAMES = {
  'metricsVersion': 'metricVersion',
};

function convertField(obj, oldName, newName) {
  obj[newName] = obj[oldName];
  delete obj[oldName];
}

function convertToCamelCase(obj) {
  function camelize(str) {
    return str.replace(/_[a-z]/g, function (str, index) {
      return str.charAt(1).toUpperCase();
    });
  }

  // Fix all _ names first (convert to camelcase)
  for (let fieldName in obj) {
    if (obj.hasOwnProperty(fieldName)) {
      if (fieldName.includes('_')) {
        convertField(obj, fieldName, camelize(fieldName));
      }
    }
  }
}

function correctOldFieldNames(obj, deprecatedFieldNamesMap) {
  for (let deprecatedName in deprecatedFieldNamesMap) {
    if (obj.hasOwnProperty(deprecatedName)) {
      const newName = deprecatedFieldNamesMap[deprecatedName];
      convertField(obj, deprecatedName, newName);
    }
  }
}

function repairFieldNames(parsedEvent) {
  if (parsedEvent.client_time_ms) {
    convertToCamelCase(parsedEvent);
    if (parsedEvent.details) {
      convertToCamelCase(parsedEvent.details);
    }
  }
  correctOldFieldNames(parsedEvent, DEPRECATED_FIELDNAMES);
}

module.exports = repairFieldNames;