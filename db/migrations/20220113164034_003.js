// om namah shivaya

'use strict';

exports.up = function (knex) {
  return knex.schema.table('Property', (table) => {
    table.string('googlePlaceId').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('Property', (table) => {
    table.dropColumn('googlePlaceId');
  });
};
