// om namah shivaya

'use strict';

exports.up = function (knex) {
  return knex.schema.table('Property', (table) => {
    table.string('imageDirectoryName');
  });
};

exports.down = function (knex) {
  return knex.schema.table('Property', (table) => {
    table.dropColumn('imageDirectoryName');
  });
};
