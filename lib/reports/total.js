'use strict';

const constants = require('../constants'),
  totalByDate = [];

function onData(dateIndex, parsedEvent) {
  totalByDate[dateIndex] = (totalByDate[dateIndex] || 0) + 1;
}

function finalize() {

  return {
    name: 'Total events by date',
    result: {
      finalTotal: totalByDate.reduce(function(a, b) { return a + b; }),
      totalByDate: totalByDate,
    }
  };
}

module.exports = {
  onData,
  finalize
};
