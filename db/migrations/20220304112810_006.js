// om namah shivaya

'use strict';

exports.up = function (knex) {
  return knex.schema.table('City', (table) => {
    table.boolean('blocked').defaultTo(false).notNullable().index();
  });
};

exports.down = function (knex) {
  return knex.schema.table('City', (table) => {
    table.dropColumn('blocked');
  });
};
