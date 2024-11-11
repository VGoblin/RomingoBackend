// om namah shivaya

'use strict';

const Stripe = require('stripe');
const { DateTime } = require('luxon');

let stripe;

function initialize() {
  stripe = Stripe(global.config.stripe.secretKey);
  console.log('stripe.js', 'initialize', 'stripe initialized');
}

function createCard(amount) {
  // add 0.5% as buffer to accomodate for any rounding offs by hotels
  amount = amount * 1.005;

  return stripe.issuing.cards.create({
    cardholder: global.config.stripe.cardholderId,
    currency: 'usd',
    type: 'virtual',
    status: 'active',
    spending_controls: {
      spending_limits: [
        {
          amount: Math.round(amount * 100),
          interval: 'all_time',
        },
      ],
    },
  });
}

function retrieveCard(id, expand) {
  if (expand === true) {
    return stripe.issuing.cards.retrieve(id, {
      expand: ['number', 'cvc'],
    });
  } else {
    return stripe.issuing.cards.retrieve(id);
  }
}

function cancelCard(id) {
  return stripe.issuing.cards.update(id, {
    status: 'canceled',
  });
}

function createTopup(amount) {
  return stripe.topups.create({
    amount: (amount * 100).toFixed(),
    currency: 'usd',
    description: `Top-up at ${DateTime.now().toUTC().toISO()}`,
    destination_balance: 'issuing',
    statement_descriptor: 'Stripe Top-up',
  });
}

function createCardholder() {
  return stripe.issuing.cardholders.create({
    billing: {
      address: {
        city: 'Fair Oaks',
        country: 'US',
        line1: '4207 Thistledown Drive',
        postal_code: '95628',
        state: 'CA',
      },
    },
    name: 'JZ Partners LLC',
    type: 'company',
    email: 'hello@romingo.com',
    phone_number: '+19165246299',
    company: {
      tax_id: '87-2268323',
    },
  });
}

function approveAuthorization(id) {
  return stripe.issuing.authorizations.approve(id);
}

function declineAuthorization(id) {
  return stripe.issuing.authorizations.decline(id);
}

function constructEvent(payload, header, secret) {
  return stripe.webhooks.constructEvent(payload, header, secret);
}

function createPaymentIntent(amount, priceKey) {
  let priceKey0 = priceKey;
  let priceKey1 = '';
  if (priceKey.length > 500) {
    priceKey0 = priceKey.substr(0, 500);
    priceKey1 = priceKey.substr(500);
  }
  return stripe.paymentIntents.create({
    amount: (amount * 100).toFixed(),
    currency: 'usd',
    payment_method_types: ['card'],
    capture_method: 'manual',
    metadata: {
      priceKey0,
      priceKey1,
    },
  });
}

function retrievePaymentIntent(id) {
  return stripe.paymentIntents.retrieve(id);
}

function capturePaymentIntent(id) {
  return stripe.paymentIntents.capture(id);
}

function cancelPaymentIntent(id) {
  return stripe.paymentIntents.cancel(id);
}

function createCustomer(email) {
  return stripe.customers.create({
    email,
  });
}

function createSetupIntent(customerId) {
  return stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
  });
}

function listPaymentMethods(customerId) {
  return stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });
}

function createPaymentIntent2(amount, customerId, paymentMethodId) {
  return stripe.paymentIntents.create({
    amount: (amount * 100).toFixed(),
    currency: 'usd',
    customer: customerId,
    payment_method: paymentMethodId,
    off_session: true,
    confirm: true,
  });
}

module.exports = {
  initialize,
  createCard,
  retrieveCard,
  cancelCard,
  createTopup,
  createCardholder,
  approveAuthorization,
  declineAuthorization,
  constructEvent,
  createPaymentIntent,
  retrievePaymentIntent,
  capturePaymentIntent,
  cancelPaymentIntent,
  createCustomer,
  createSetupIntent,
  listPaymentMethods,
  createPaymentIntent2,
};
