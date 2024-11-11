// om namah shivaya

'use strict';

// require scripts
const { sendIssuingInfoEmail } = require('../../sendgrid/sendgrid')
const stripe = require('../stripe.js');

const secret =
  global.config.stripe.webhooks['issuing_authorization.request'].signingSecret;

async function receive(req, res) {
  try {
    const signature = req.headers['stripe-signature'];
    const event = stripe.constructEvent(req.body, signature, secret);
    // console.log(event);
    if (event.type === 'issuing_authorization.request') {
      const auth = event.data.object;
      sendIssuingInfoEmail(auth)
      await handleAuthorizationRequest(auth);
    }
    res.json({ received: true });
  } catch (e) {
    console.error(e);
    res.status(400).send(e.message);
  }
}

function handleAuthorizationRequest(auth) {
  const approve = verify(auth);
  if (approve) {
    return stripe.approveAuthorization(auth.id);
  } else {
    return stripe.declineAuthorization(auth.id);
  }
}

function verify(auth) {
  // if (data.address_line1_check === 'mismatch') {
  //   return false;
  // }

  // if (data.address_postal_code_check === 'mismatch') {
  //   return false;
  // }

  // if (auth.verification_data.cvc_check !== 'match') {
  //   console.log(
  //     `cvc_check failed for card id ${auth.card.id} having last 4 digits as ${auth.card.last4}`
  //   );
  //   return false;
  // }

  if (auth.verification_data.expiry_check !== 'match') {
    console.log(
      `expiry_check failed for card id ${auth.card.id} having last 4 digits as ${auth.card.last4}`
    );
    return false;
  }

  console.log(
    `authorization succeeded for card id ${auth.card.id} having last 4 digits as ${auth.card.last4}`
  );

  return true;
}

module.exports = {
  receive,
};
