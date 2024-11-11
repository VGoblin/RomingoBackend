// om namah shivaya

'use strict';

const { DateTime } = require('luxon');

function computeRequestPayload(
  email,
  mobile,
  bookingKey,
  adults,
  children,
  card,
  paymentPolicy
) {
  const req = {
    targetPcc: global.config.sabre.pcc,
    agency: {
      address: {
        name: 'Romingo',
        street: '4207 Thistledown Drive',
        city: 'Fair Oaks',
        stateProvince: 'CA',
        postalCode: '95628',
        countryCode: 'US',
        freeText: 'Romingo, 4207 Thistledown Drive, Fair Oaks, CA 95628',
      },
      ticketingPolicy: 'TODAY',
      agencyCustomerNumber: '1234567890',
    },
    hotel: {
      bookingKey,
      rooms: [
        {
          travelerIndices: [],
        },
      ],
      paymentPolicy,
      formOfPayment: 1,
    },
    travelers: [],
    contactInfo: {
      emails: [email],
      phones: [`+${mobile.countryCallingCode}${mobile.number}`],
    },
    payment: {
      formsOfPayment: [
        {
          type: 'PAYMENTCARD',
          cardTypeCode: 'VI',
          cardNumber: card.number,
          cardSecurityCode: card.cvc,
          expiryDate: `${card.exp_year}-${('0' + card.exp_month).slice(-2)}`,
          cardHolder: {
            givenName: card.cardholder.name,
            surname: card.cardholder.name,
            email: card.cardholder.email,
            phone: card.cardholder.phone_number,
            address: {
              name: card.cardholder.name,
              street: card.cardholder.billing.address.line1,
              city: card.cardholder.billing.address.city,
              stateProvince: card.cardholder.billing.address.state,
              postalCode: card.cardholder.billing.address.postal_code,
              countryCode: card.cardholder.billing.address.country,
            },
          },
        },
      ],
    },
  };

  // travelerIndices
  const totalGuests = adults.length + children.length;

  for (let i = 1; i <= totalGuests; i++) {
    req.hotel.rooms[0].travelerIndices.push(i);
  }

  // travelers (adults)
  for (let i = 0; i < adults.length; i++) {
    const adult = adults[i];
    const traveler = {
      givenName: adult.firstName,
      surname: adult.lastName,
      passengerCode: 'ADT',
    };
    if (i === 0) {
      traveler.emails = [email];
    }
    req.travelers.push(traveler);
  }

  // travelers (children)
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const traveler = {
      givenName: child.firstName,
      surname: child.lastName,
      birthDate: DateTime.now()
        .toUTC()
        .minus({ years: child.age })
        .toFormat('yyyy-MM-dd'),
      age: child.age,
      passengerCode: 'INF',
    };
    req.travelers.push(traveler);
  }

  return JSON.stringify(req);
}

function parseResponse(json) {
  const j = json;
  const res = {};
  res.raw = j;

  res.sabreConfirmationId = j.confirmationId;

  return res;
}

module.exports = {
  computeRequestPayload,
  parseResponse,
};
