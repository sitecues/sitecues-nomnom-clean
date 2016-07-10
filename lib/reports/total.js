'use strict';

const totalByDate = [],
  startTime = Date.now();

function onData(dateIndex /* , parsedEvent */) {
  totalByDate[dateIndex] = (totalByDate[dateIndex] || 0) + 1;
}

function finalize() {
  const endTime = Date.now(),
    totalSeconds = Math.round((endTime - startTime) / 1000),
    totalEvents = totalByDate.reduce(function(a, b) { return a + b; });

  return {
    name: 'Total events by date',
    result: {
      processingTime: totalSeconds + 's',
      processingSpeed: Math.round(totalEvents / totalSeconds) + '/s',
      totalEvents,
      totalByDate
    }
  };
}

module.exports = {
  onData,
  finalize
};
