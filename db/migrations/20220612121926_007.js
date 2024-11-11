// om namah shivaya

'use strict';

exports.up = function (knex) {
  return knex.schema.table('Booking', (table) => {
    table.specificType('bookingMethod', 'smallint').nullable();
    table.timestamp('deadlineLocal', { useTz: false }).nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('Booking', (table) => {
    table.dropColumn('bookingMethod');
    table.dropColumn('deadlineLocal');
  });
};
