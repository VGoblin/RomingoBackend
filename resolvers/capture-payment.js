// om namah shivaya

'use strict';

// require scripts
const uuid = require('uuid');
const stripe = require('../stripe/stripe.js');
const pg = require('../db/postgres/postgres.js');

async function capturePayment(parent, args) {
  let {id, amount, paymentMethodId, customerId} = args.input;
  try {
    let createPaymentIntent = await stripe.createPaymentIntent2(amount, customerId, paymentMethodId);
    await pg.updateBookingPaymentIntent(id, createPaymentIntent.id)
    if (createPaymentIntent) {
      // let response = await stripe.capturePaymentIntent(createPaymentIntent.id)
      await pg.paymentCaptured(id)
      return {
        statusCode:200,
        status:"Payment successfully captured."
      } 
    }
  }
  catch(e) {
    return {
      statusCode:400,
      status:e.message
    }
  }
}

module.exports = {
  capturePayment,
};
