// om namah shivaya

'use strict';

exports.up = function (knex) {
  return knex.schema.table('Booking', (table) => {
    table.string('customerChargedStatus').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('Booking', (table) => {
    table.dropColumn('customerChargedStatus');
  });
};
