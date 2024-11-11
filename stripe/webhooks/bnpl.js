// om namah shivaya

'use strict';

// require scripts
const { DateTime } = require('luxon');
const pg = require('../../db/postgres/postgres.js');
const stripe = require('../stripe.js');

async function receive(req, res) {
  try {
    return res.json({ success: true})
    
    console.log(`BNPL job started at ${DateTime.now().toISO()}.`);

    const bookings = await pg.adminBookingsToCharge();
    console.log(`${bookings.length} bookings found.`);

    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      console.log(`Processing Booking ID ${booking.id}.`);
      const paymentMethods = await stripe.listPaymentMethods(
        booking.customerId
      );
      const paymentMethodId = paymentMethods.data[0].id;
      try {
        const paymentIntent = await stripe.createPaymentIntent2(
          +booking.data.totalPriceAfterTax,
          booking.customerId,
          paymentMethodId
        );
        await pg.adminUpdateCustomerChargedStatus(
          booking.id,
          'succeeded',
          paymentIntent.id
        );
        console.log(`Charge to Booking ID ${booking.id} succeeded.`);
      } catch (e) {
        console.error(e);
        await pg.adminUpdateCustomerChargedStatus(
          booking.id,
          'failed',
          e.raw.payment_intent.id,
          e.message
        );
        console.log(`Charge to Booking ID ${booking.id} failed.`);
      }
    }
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
}

module.exports = {
  receive,
};
