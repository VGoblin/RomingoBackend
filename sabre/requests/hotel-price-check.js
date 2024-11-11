// om namah shivaya

'use strict';

// require scripts
const { DateTime } = require('luxon');

const common = require('./common.js');

function computeRequestPayload(priceKey) {
  const req = {
    HotelPriceCheckRQ: {
      POS: {
        Source: {
          PseudoCityCode: global.config.sabre.pcc,
        },
      },
      RateInfoRef: {
        RateKey: priceKey,
      },
    },
  };

  return JSON.stringify(req);
}

function parseResponse(json) {
  let j = json;
  const res = {};
  res.raw = j;

  j = j.HotelPriceCheckRS.PriceCheckInfo;

  res.bookingKey = j.BookingKey;

  res.priceChanged = j.PriceChange;
  res.priceDifference = j.PriceDifference;

  if (j.ConvertedPriceChange === true) {
    res.priceChanged = j.ConvertedPriceChange;
    res.priceDifference = j.ConvertedPriceDifference;
  }

  res.sabreId = j.HotelInfo.HotelCode;

  j = j.HotelRateInfo.Rooms.Room[0].RatePlans.RatePlan[0];

  common.hydrateMeals(j.MealsIncluded, res);
  common.hydratePrices(j.ConvertedRateInfo, res);
  common.hydrateFees(j.ConvertedRateInfo.Fees, res);
  common.hydrateCancelationPolicy(
    j.ConvertedRateInfo.CancelPenalties.CancelPenalty[0],
    res,
    DateTime.fromISO(j.ConvertedRateInfo.StartDate).toJSDate()
  );

  res.guaranteeType = j.ConvertedRateInfo.Guarantee?.GuaranteeType;

  if (res.guaranteeType === 'DEP') {
    res.guaranteeType = 'DEPOSIT';
  } else {
    res.guaranteeType = 'GUARANTEE';
  }

  return res;
}

module.exports = {
  computeRequestPayload,
  parseResponse,
};
