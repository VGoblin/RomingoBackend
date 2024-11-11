// om namah shivaya

'use strict';

// require scripts
const sabre = require('../sabre/sabre.js');
const stripe = require('../stripe/stripe.js');

async function createPaymentIntent(parent, args) {
  let res = await sabre.validatePrice(args.input.priceKey);

  if (res.priceChanged === true) {
    return res;
  }

  const paymentIntent = await stripe.createPaymentIntent(
    res.totalPriceAfterTax,
    args.input.priceKey
  );

  return {
    paymentIntent: {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      clientSecret: paymentIntent.client_secret,
    },
  };
}

module.exports = {
  createPaymentIntent,
};
