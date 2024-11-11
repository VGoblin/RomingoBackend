// om namah shivaya

'use strict';

// require scripts
const faunadb = require('faunadb');

const q = faunadb.query;

const client = new faunadb.Client({
  secret: global.config.fauna.secret,
  domain: 'db.us.fauna.com',
  port: 443,
  scheme: 'https',
});

function createBooking(data) {
  return client.query(
    q.Create(q.Collection('Booking'), {
      data,
    })
  );
}

module.exports = {
  createBooking,
};
