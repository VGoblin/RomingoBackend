// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

async function bookingList(parent, args) {

  let list = await pg.bookingList();
  let response = []
  for (let idx = 0; idx < list.length; idx++) {
    let booking = list[idx]
    let hotel = await pg.getPropertyNameById(booking.propertyId)
    booking.hotel = {
      name: hotel
    }
    response.push(booking)
  }
  return response
}

module.exports = {
  bookingList,
};
