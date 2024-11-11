// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

function getBookingDetails(parent, args) {
    const bookingId = args.input.id
    return pg.getBookingById(bookingId);
}

module.exports = {
    getBookingDetails,
};
