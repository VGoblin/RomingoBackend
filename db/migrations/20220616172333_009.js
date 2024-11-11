// om namah shivaya

'use strict';

exports.up = function (knex) {
  return knex.schema.table('Booking', (table) => {
    table.dropUnique(null, 'booking_paymentintentid_unique');
  });
};

exports.down = function (knex) {
  return knex.schema.table('Booking', (table) => {
    table.unique(['paymentIntentId']);
  });
};
