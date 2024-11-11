// om namah shivaya

'use strict';

// require scripts
const sabre = require('../sabre/sabre.js');
const pg = require('../db/postgres/postgres.js');
const sendgrid = require('../sendgrid/sendgrid.js');

async function cancelBooking(parent, args) {

    const createPayloads = {
        confirmationId: args.input.confirmationId,
        bookingSource: "SABRE",
        cancelAll: args.input.cancelAll
    }
    try {
        let res = await sabre.cancelBooking(createPayloads);
        if (res) {
            const updateReservationStatus = await pg.updateBookingBySabreConfirmationId(args.input.confirmationId, 'cancelled');
            if (updateReservationStatus) {
                const reservation = await pg.getBookingByConfirmationIdOnly(args.input.confirmationId)
                const data = reservation[0]

                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const checkInDate = new Date(data.checkInAtLocal)
                const checkOutDate = new Date(data.checkOutAtLocal)

                await sendgrid.sendCancelBooking(
                  data.email,
                  `${data.firstName} ${data.lastName}`,
                  {
                    hotelName: data.hotelName,
                    propertyConfirmationId: data.propertyConfirmationId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    guestName: `${data.firstName} ${data.lastName}`,
                    numAdults: data.data.noOfAdults,
                    numChildren: data.data.noOfChildren,
                    numDogs: data.data.noOfDogs,
                    nightlyRate: `$${data.data.averagePriceAfterTax}`,
                    subscribeLink: `https://romingo.us6.list-manage.com/subscribe/post-json?u=585083137c3540a7371e3a74f&id=d4d3932414&EMAIL=${data.email}`,
                    checkInAtLocal: checkInDate.toLocaleDateString("en-US", options),
                    checkOutAtLocal: checkOutDate.toLocaleDateString("en-US", options),
                    totalPriceAfterTax: `$${data.data.totalPriceAfterTax}`,
                  }
                );
             
                return { "status": true } ;
            }
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    cancelBooking,
};
