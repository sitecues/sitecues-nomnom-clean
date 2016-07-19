'use strict';

const totalByDate = [],
  startTime = Date.now();

let config;

function onData(dateIndex /* , parsedEvent */) {
  totalByDate[dateIndex] = (totalByDate[dateIndex] || 0) + 1;
}

function init(_config) {
  config = _config;
}

function finalize() {
  const endTime = Date.now(),
    totalSeconds = (endTime - startTime) / 1000,
    totalEvents = totalByDate.reduce(function(a, b) { return a + b; }, 0);

  return {
    timing: {
      processingTime: totalSeconds.toFixed(1) + 's',
      processingSpeed: Math.round(totalEvents / totalSeconds) + '/s',
      totalEvents
    },
    totalByDate,
    config
  };
}

module.exports = {
  init,
  onData,
  finalize
};
