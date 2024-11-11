// om namah shivaya

'use strict';

function computeRequestPayload(sabreConfirmationId) {
  const req = {
    confirmationId: sabreConfirmationId,
  };

  return JSON.stringify(req);
}

function parseResponse(json) {
  let j = json;
  const res = {};
  res.raw = j;

  j = j.hotels[0];
  res.propertyConfirmationId = j.confirmationId;
  res.checkInAtLocal = `${j.checkInDate}T${j.checkInTime}:00`;
  res.checkOutAtLocal = `${j.checkOutDate}T${j.checkOutTime}:00`;
  res.roomType = j.room.roomType;

  j = j.payment;
  res.payment = {
    subtotal: j.subtotal ?? 0,
    taxes: j.taxes ?? 0,
    fees: j.fees ?? 0,
    total: j.total,
    currencyId: j.currencyCode,
  };

  return res;
}

module.exports = {
  computeRequestPayload,
  parseResponse,
};
