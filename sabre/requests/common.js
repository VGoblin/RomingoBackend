// om namah shivaya

'use strict';

// require scripts
const { DateTime } = require('luxon');

function hydrateMeals(json, room) {
  if (!json) {
    return;
  }

  room.breakfastIncluded = json.Breakfast;
  room.lunchIncluded = json.Lunch;
  room.dinnerIncluded = json.Dinner;
}

function hydratePrices(json, room) {
  room.averagePrice = json.AverageNightlyRateBeforeTax;
  room.totalPrice = json.AmountBeforeTax;
  room.averagePriceAfterTax = json.AverageNightlyRate;
  room.totalPriceAfterTax = json.AmountAfterTax;
  room.feesIncluded = json.AdditionalFeesInclusive;
}

function hydrateFees(json, room) {
  room.fees = [];

  if (!json) {
    return;
  }

  room.totalFees = json.Amount;

  if (!json.FeeGroups) {
    return;
  }

  json = json.FeeGroups.FeeGroup;

  for (let i = 0; i < json.length; i++) {
    room.fees.push({
      amount: json[i].Amount,
      desc: json[i].Description,
    });
  }
}

function hydrateCancelationPolicy(json, room, checkIn) {
  const cancelable = json.Refundable;
  let deadlineLocal;
  let deadlineUnit;
  let deadlineMultiplier;
  let deadlineReference;
  if (cancelable && json.Deadline) {
    deadlineLocal = json.Deadline.AbsoluteDeadline;
    deadlineUnit = json.Deadline.OffsetTimeUnit;
    deadlineMultiplier = json.Deadline.OffsetUnitMultiplier;
    deadlineReference = json.Deadline.OffsetDropTime;

    if (!deadlineLocal) {
      if (deadlineReference === 'BeforeArrival') {
        if (deadlineUnit === 'Day') {
          deadlineLocal = DateTime.fromJSDate(checkIn)
            .minus({
              days: deadlineMultiplier,
            })
            .toUTC()
            .toISO({
              suppressMilliseconds: true,
              includeOffset: false,
            });
        } else if (deadlineUnit === 'Hour') {
          deadlineLocal = DateTime.fromJSDate(checkIn)
            .minus({
              hours: deadlineMultiplier,
            })
            .toUTC()
            .toISO({
              suppressMilliseconds: true,
              includeOffset: false,
            });
        }
      }
    }
  }
  const desc = json.PenaltyDescription?.Text;

  room.cancelationPolicy = {
    cancelable,
    deadlineLocal,
    deadlineUnit,
    deadlineMultiplier,
    deadlineReference,
    desc,
  };
}

module.exports = {
  hydrateMeals,
  hydratePrices,
  hydrateFees,
  hydrateCancelationPolicy,
};
