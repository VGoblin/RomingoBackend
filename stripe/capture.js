const stripe = require('stripe')('sk_test_51LdSTEGF0rm4Im0MfRt4RHpw2sTJFeAjTu2elXWZnetL3MRS5D2rGHgJQv81wXRrYlzWViPRTONZcuMXGgDhBhZS00SNBVgTNo');

async function capture() {
    // const paymentIntent = await stripe.paymentIntents.create({
    //     amount: 1099,
    //     currency: 'usd',
    //     payment_method_types: ['card'],
    //     capture_method: 'manual',
    //   });
}

async function capture1() {
    // const intent = await stripe.paymentIntents.capture('pi_3LdX5iGF0rm4Im0M1WsUZxvx', {
    //     amount_to_capture: 750,
    //   })
}

