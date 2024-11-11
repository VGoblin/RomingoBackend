// om namah shivaya

'use strict';

// require scripts
const sabre = require('../sabre/sabre.js');
const pg = require('../db/postgres/postgres.js');

async function modifyBooking(parent, args) {

    const createPayloads = {
        confirmationId: args.input.confirmationId,
        bookingSource: "SABRE",
        cancelAll: args.input.cancelAll
    }
    try {
        let res = await sabre.cancelBooking(createPayloads);
        if (res) {
            // Booking cancelled now create new booking code goes here
            return res;
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    modifyBooking,
};
