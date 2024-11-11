// om namah shivaya

'use strict';

// require scripts
const stripe = require('../stripe/stripe.js');

async function createSetupIntent(parent, args) {
  const customer = await stripe.createCustomer(args.input.email);
  const setupIntent = await stripe.createSetupIntent(customer.id);

  return {
    customerId: customer.id,
    clientSecret: setupIntent.client_secret,
  };
}

module.exports = {
  createSetupIntent,
};
