// om namah shivaya

'use strict';

// require scripts
const sgMail = require('@sendgrid/mail');

const c = global.config.sendgrid;
sgMail.setApiKey(c.apiKey);

function sendCreateBookingSucceeded(toEmail, toName, data) {
  if (global.config.env === 'dev' || !data.hotelName) {
    return
  }
  return send(toEmail, toName, c.newBookingTemplateId, data);
}

function sendCancelBooking(toEmail, toName, data) {
  if (global.config.env === 'dev') {
    return
  }
  return send(toEmail, toName, c.cancelBookingTemplateId, data);
}

function sendBookingReminder(toEmail, hotelEmail, name, data) {
  if (global.config.env === 'dev' || !toEmail) {
    return
  }

  let emailSend = {
    from: {
      email: c.from.email,
      name: c.from.name,
    },
    to: {
      email: toEmail,
      name: name,
    },
    bcc: c.bcc,
    templateId: c.preArrivalToHotelId,
    dynamicTemplateData: data,
  }

  if (hotelEmail) {
    emailSend.cc = hotelEmail
  }

  return sgMail.send(emailSend)
}

function sendCreateBookingFailed(doc) {
  if (global.config.env  === 'dev') {
    return
  }
  
  const msg = {
    from: {
      email: c.from.email,
      name: c.from.name,
    },
    to: c.bcc,
    subject: `Booking Id ${doc.bookingId} failed`,
    text: `Email: ${doc.request.email}\nMobile: +${doc.request.mobile.countryCallingCode}${doc.request.mobile.number}\nName: ${doc.request.adults[0].firstName} ${doc.request.adults[0].lastName}`,
    attachments: [
      {
        content: Buffer.from(JSON.stringify(doc)).toString('base64'),
        filename: 'doc.json',
        type: 'application/json',
        disposition: 'attachment',
      },
    ],
  };
  return sgMail.send(msg);
}

function sendIssuingInfoEmail(doc) {

  if (global.config.env === 'dev') {
    return
  }
  
  const msg = {
    from: {
      email: c.from.email,
      name: c.from.name,
    },
    to: c.bcc,
    subject: `Issuing Card has been charged — Romingo`,
    text: `${JSON.stringify(doc)}`,
  };
  return sgMail.send(msg);
}

function sendResetPasswordLink(doc, isAdmin) {
  // if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_NODE_ENV === 'dev') {
  //   return
  // }

  const text = isAdmin ? `Temporary Password: ${doc.request.password}`

  :`
      Email: ${doc.request.email}\n
      ResetLink: ?token=${doc.request.token}userId=&${doc.request.userId}
    `

  const msg = {
    from: {
      email: c.from.email,
      name: c.from.name,
    },
    to: doc.request.email,
    subject: isAdmin ? 'Temporary Password for Romingo Admin Panel' : `Reset Password Link`,
    text: text
  };
  return sgMail.send(msg);
}

function send(toEmail, toName, templateId, data) {
  const msg = {
    from: {
      email: c.from.email,
      name: c.from.name,
    },
    to: {
      email: toEmail,
      name: toName,
    },
    bcc: c.bcc,
    templateId: templateId,
    dynamicTemplateData: data,
  };
  return sgMail.send(msg);
}

module.exports = {
  sendCreateBookingSucceeded,
  sendCreateBookingFailed,
  sendBookingReminder,
  sendResetPasswordLink,
  sendCancelBooking,
  sendIssuingInfoEmail,
};
