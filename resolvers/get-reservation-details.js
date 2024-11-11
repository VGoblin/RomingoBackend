// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

async function getReservationDetails(parent, args) {
    console.log('reservation details')
    try {
        const email = args.input.email, propertyConfirmationId = args.input.propertyConfirmationId
        let list = await pg.getBookingByConfirmationId(email, propertyConfirmationId);
        // console.log(list)
        // To calculate the time difference of two dates
        if (list[0].hotelName) {
            list[0].hotel = {};
            list[0].hotel.name = list[0].hotelName;
            list[0].hotel.address = list[0].addressLine1;
            list[0].hotel.zipCode = list[0].zipCode;
        }
        var differenceInTime = list[0].checkInAtLocal.getTime() - new Date().getTime();
        // To calculate the no. of days between two dates
        var differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24));
        if (list[0].reservationStatus === "cancelled") return list;
        if (differenceInDays > 1) list[0].reservationStatus = "upcoming";
        if (differenceInDays < 0) list[0].reservationStatus = "finished";
        if (differenceInDays == 0 || differenceInDays == 1) list[0].reservationStatus = "current";

        return list;
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    getReservationDetails,
};
