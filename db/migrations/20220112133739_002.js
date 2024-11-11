// om namah shivaya

'use strict';

exports.up = function (knex) {
  return knex.schema.createTable('Room', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .notNullable();
    table
      .uuid('propertyId')
      .notNullable()
      .references('id')
      .inTable('Property')
      .index();
    table
      .specificType('sabreNames', 'varchar(255)[]')
      .defaultTo('{}')
      .notNullable();
    table
      .specificType('sabreRoomTypeCodes', 'smallint[]')
      .defaultTo('{}')
      .notNullable();
    table
      .specificType('sabreRoomIds', 'varchar(255)[]')
      .defaultTo('{}')
      .notNullable();
    table.string('name').notNullable();
    table.specificType('areaInSquareFeet', 'smallint').nullable();
    table.string('featuredImageFilename').nullable();
    table
      .specificType('imageFilenames', 'varchar(255)[]')
      .defaultTo('{}')
      .notNullable();
    table
      .timestamp('createdAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    table
      .timestamp('updatedAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('Room');
};
