// om namah shivaya

'use strict';

// require scripts
const stripe = require('../stripe.js');
const itc = require('./issuing_transaction.created.js');

const secret = global.config.stripe.webhooks.all.signingSecret;

async function receive(req, res) {
  try {
    const signature = req.headers['stripe-signature'];
    const event = stripe.constructEvent(req.body, signature, secret);
    console.log(JSON.stringify(event));
    if (event.type === 'issuing_transaction.created') {
      await itc.receive(event);
    }
    res.json({ received: true });
  } catch (e) {
    console.error(e);
    res.status(400).send(e.message);
  }
}

module.exports = {
  receive,
};
