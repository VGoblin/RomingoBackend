// om namah shivaya

'use strict';

exports.up = function (knex) {
  return knex.schema.table('Room', (table) => {
    table.dropColumn('sabreRoomTypeCodes');
    table.dropColumn('sabreRoomIds');
    table.specificType('sabreTexts', 'text[]').defaultTo('{}').notNullable();
    table.boolean('blocked').defaultTo(false).notNullable().index();
  });
};

exports.down = function (knex) {
  return knex.schema.table('Room', (table) => {
    table
      .specificType('sabreRoomTypeCodes', 'smallint[]')
      .defaultTo('{}')
      .notNullable();
    table
      .specificType('sabreRoomIds', 'varchar(255)[]')
      .defaultTo('{}')
      .notNullable();
    table.dropColumn('sabreTexts');
    table.dropColumn('blocked');
  });
};
