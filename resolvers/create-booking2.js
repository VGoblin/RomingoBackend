// om namah shivaya

'use strict';

// require scripts
const uuid = require('uuid');
const stripe = require('../stripe/stripe.js');
const sabre = require('../sabre/sabre.js');
const pg = require('../db/postgres/postgres.js');
const sendgrid = require('../sendgrid/sendgrid.js');
const fauna = require('../db/fauna/fauna.js');
const axios = require('axios').default;


async function createBooking(parent, args) {
  const doc = {
    request: args.input,
    responses: {
      validatePrice: null,
      createBooking: null,
      getBooking: null,
    },
    // paymentIntentFound: null,
    // paymentIntentCapturable: null,
    priceUnchanged: null,
    cardId: null,
    sabreConfirmationId: null,
    // paymentIntentCaptured: null,
    bookingId: uuid.v4(),
    savedToPostgres: null,
    emailSent: null,
    // paymentIntentCanceled: null,
    cardCanceled: null,
    success: false,
    bookingMethod: 2,
  };

  let propertyConfirmationId;

  try {
    // const paymentIntent = await stripe.retrievePaymentIntent(
    //   args.input.paymentIntentId
    // );

    // doc.paymentIntentFound = true;

    // if (paymentIntent.status !== 'requires_capture') {
    //   throw new Error('Payment Intent not capturable');
    // }

    // doc.paymentIntentCapturable = true;

    // const priceKey =
    //   paymentIntent.metadata.priceKey0 + paymentIntent.metadata.priceKey1;

    const validatePriceRes = await sabre.validatePrice(args.input.priceKey);
    doc.responses.validatePrice = validatePriceRes;

    if (validatePriceRes.priceChanged === true) {
      // await stripe.cancelPaymentIntent(paymentIntent.id);
      // doc.paymentIntentCanceled = true;

      await fauna.createBooking(doc);

      return {
        priceChanged: validatePriceRes.priceChanged,
        priceDifference: validatePriceRes.priceDifference,
        totalPriceAfterTax: validatePriceRes.totalPriceAfterTax,
        booking: {
          id: doc.bookingId,
        },
      };
    }

    doc.priceUnchanged = true;

    let card = await stripe.createCard(validatePriceRes.averagePriceAfterTax);
    doc.cardId = card.id;
    card = await stripe.retrieveCard(card.id, true);

    const createBookingRes = await sabre.createBooking(
      args.input.email,
      args.input.mobile,
      validatePriceRes.bookingKey,
      args.input.adults,
      args.input.children,
      card,
      validatePriceRes.guaranteeType
    );
    doc.responses.createBooking = createBookingRes;
    doc.sabreConfirmationId = createBookingRes.sabreConfirmationId;

    if (!doc.sabreConfirmationId) {
      console.log(createBookingRes.raw.errors)
      throw new Error('sabreConfirmationId not found');
    }
    
    const getBookingRes = await sabre.getBooking(
      createBookingRes.sabreConfirmationId
    );
    doc.responses.getBooking = getBookingRes;
    propertyConfirmationId = getBookingRes.propertyConfirmationId;

    const row = await pg.propertyBySabreId(validatePriceRes.sabreId);

    const data = {
      noOfAdults: args.input.adults.length,
      noOfChildren: args.input.children.length,
      noOfDogs: args.input.noOfDogs,
      breakfastIncluded: validatePriceRes.breakfastIncluded,
      lunchIncluded: validatePriceRes.lunchIncluded,
      dinnerIncluded: validatePriceRes.dinnerIncluded,
      averagePrice: validatePriceRes.averagePrice,
      totalPrice: validatePriceRes.totalPrice,
      averagePriceAfterTax: validatePriceRes.averagePriceAfterTax,
      totalPriceAfterTax: validatePriceRes.totalPriceAfterTax,
      totalFees: validatePriceRes.totalFees,
      fees: validatePriceRes.fees,
      feesIncluded: validatePriceRes.feesIncluded,
      cancelationPolicy: validatePriceRes.cancelationPolicy,
      roomType: getBookingRes.roomType,
      payment: getBookingRes.payment,
      utmSource: args.input.utmSource || 'direct',
      utmMedium: args.input.utmMedium || 'direct'
    };

    await pg.createBooking(
      doc.bookingId,
      row.id,
      args.input.paymentIntentId,
      card.id,
      createBookingRes.sabreConfirmationId,
      getBookingRes.propertyConfirmationId,
      args.input.adults[0].firstName,
      args.input.adults[0].lastName,
      args.input.email,
      args.input.mobile.countryCallingCode,
      args.input.mobile.number,
      getBookingRes.checkInAtLocal,
      getBookingRes.checkOutAtLocal,
      JSON.stringify(data),
      2,
      validatePriceRes.cancelationPolicy.deadlineLocal,
      args.input.customerId,
      process.env.Capture == 'required' ? 1 : 0,
      args.input.intentType,
      JSON.stringify(args.input.setupIntentObject),
    );
    doc.savedToPostgres = true;

    if (args.input.paymentIntentId) {
      stripe.capturePaymentIntent(args.input.paymentIntentId)
    }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const checkInDate = new Date(getBookingRes.checkInAtLocal)
    const checkOutDate = new Date(getBookingRes.checkOutAtLocal)

    const emailData = {
      hotelName: row.name,
      propertyConfirmationId: getBookingRes.propertyConfirmationId,
      firstName: args.input.adults[0].firstName,
      lastName: args.input.adults[0].lastName,
      cityName: `${getBookingRes.raw.hotels[0].address.city}`, //address.street address.stateProvince address.postalCode
      guestName: `${args.input.adults[0].firstName} ${args.input.adults[0].lastName}`,
      numAdults: data.noOfAdults,
      numChildren: data.noOfChildren,
      numDogs: data.noOfDogs,
      nightlyRate: `$${validatePriceRes.averagePriceAfterTax}`,
      reservationLink: `https://romingo.com/reservation/details?id=${propertyConfirmationId}&email=${args.input.email}`,
      subscribeLink: `https://romingo.us6.list-manage.com/subscribe/post-json?u=585083137c3540a7371e3a74f&id=d4d3932414&EMAIL=${args.input.email}`,
      checkInAtLocal: checkInDate.toLocaleDateString("en-US", options),
      checkOutAtLocal: checkOutDate.toLocaleDateString("en-US", options),
      roomType: getBookingRes.roomType ?? 'N/A',
      totalPriceAfterTax: `$${validatePriceRes.totalPriceAfterTax}`,
    };

    if (args.input.adults.length === 1) {
      emailData.occupants = `${args.input.adults.length} adult`;
    } else {
      emailData.occupants = `${args.input.adults.length} adults`;
    }

    if (args.input.children.length === 1) {
      emailData.occupants += `, 1 child`;
    } else if (args.input.children.length > 1) {
      emailData.occupants += `, ${args.input.children.length} children`;
    }

    if (args.input.noOfDogs === 1) {
      emailData.occupants += `, 1 dog`;
    } else if (args.input.noOfDogs > 1) {
      emailData.occupants += `, ${args.input.noOfDogs} dogs`;
    }

    if (validatePriceRes.cancelationPolicy.cancelable === true) {
      if (validatePriceRes.cancelationPolicy.deadlineLocal) {
        const deadlineLocal = new Date(validatePriceRes.cancelationPolicy.deadlineLocal);
        emailData.cancelationPolicy = `Refundable. Cancel before ${deadlineLocal.toLocaleDateString("en-US", options)} hotel time.`;
      } else {
        emailData.cancelationPolicy =
          'Refundable. Conditions apply. Contact Romingo Support for details.';
      }
    } else {
      emailData.cancelationPolicy = 'Non refundable.';
    }

    // console.log(JSON.stringify(emailData));

    await sendgrid.sendCreateBookingSucceeded(
      args.input.email,
      `${args.input.adults[0].firstName} ${args.input.adults[0].lastName}`,
      emailData
    );
    doc.emailSent = true;

    doc.success = true;

    const faunaDoc = await fauna.createBooking(doc);

    await pg.updateBookingWithFaunaDocId(doc.bookingId, faunaDoc.ref.value.id);

    //GA4 event
    if (process.env.GA4_SECRET_KEY && global.config.env !== 'dev') {
      console.log('send to GA4')
      axios.post(`https://www.google-analytics.com/mp/collect?api_secret=${process.env.GA4_SECRET_KEY}&measurement_id=${process.env.GA4_MEASUREMENT_ID}`, {
        client_id: args.input.email,
        events: [
          {
            "name": "checkout_success_backend",
          }
        ]
      }).then(function(res) {
        console.log(res)
      }).catch(function(err) {
        console.log(err)
      })
    }

    return {
      booking: {
        id: doc.bookingId,
        sabreConfirmationId: doc.sabreConfirmationId,
        propertyConfirmationId: propertyConfirmationId,
        faunaDocId: faunaDoc.ref.value.id,
      },
    };
  } catch (e) {
    console.error(e);
    doc.error = e.message;
    const faunaDocId = await handleError(doc);

    return {
      booking: {
        id: doc.bookingId,
        sabreConfirmationId: doc.sabreConfirmationId,
        propertyConfirmationId: propertyConfirmationId,
        faunaDocId,
      },
    };
  }
}

async function handleError(doc) {
  try {
    await sendgrid.sendCreateBookingFailed(doc);
  } catch (e) {
    console.error(e);
  }
  try {
    if (!doc.sabreConfirmationId) {
      if (doc.cardId) {
        await stripe.cancelCard(doc.cardId);
        doc.cardCanceled = true;
      }
    }
    const faunaDoc = await fauna.createBooking(doc);
    return faunaDoc.ref.value.id;
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  createBooking,
};
