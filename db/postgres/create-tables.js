// om namah shivaya

'use strict';

const { knex } = require('./postgres.js');

async function createTables() {
  // safety check
  if (process.env.NODE_ENV === 'production') {
    throw new Error('createTables cannot run in production environment');
  }

  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "postgis";');

  // dropping tables
  await knex.raw('DROP TABLE IF EXISTS "Booking";');
  await knex.raw('DROP TABLE IF EXISTS "Property";');
  await knex.raw('DROP TABLE IF EXISTS "Activity";');
  await knex.raw('DROP TABLE IF EXISTS "City";');
  await knex.raw('DROP TABLE IF EXISTS "State";');
  await knex.raw('DROP TABLE IF EXISTS "Country";');
  await knex.raw('DROP TABLE IF EXISTS "DogAmenity";');
  await knex.raw('DROP TABLE IF EXISTS "ActivityType";');

  // ActivityType
  await knex.schema.createTable('ActivityType', (table) => {
    table.specificType('id', 'smallserial').primary().notNullable();
    table.string('name').notNullable().unique();
    table
      .timestamp('createdAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    table
      .timestamp('updatedAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
  });

  // DogAmenity
  await knex.schema.createTable('DogAmenity', (table) => {
    table.specificType('id', 'smallserial').primary().notNullable();
    table.string('name').notNullable().unique();
    table.string('desc').notNullable();
    table
      .timestamp('createdAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    table
      .timestamp('updatedAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
  });

  // Country
  await knex.schema.createTable('Country', (table) => {
    table.string('id', 2).primary().notNullable();
    table.string('name').notNullable().unique();
    table
      .timestamp('createdAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    table
      .timestamp('updatedAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
  });

  // State
  await knex.schema.createTable('State', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .notNullable();
    table
      .string('countryId', 2)
      .notNullable()
      .references('id')
      .inTable('Country')
      .index();
    table.string('code').notNullable().index();
    table.string('name').notNullable().index();
    table
      .timestamp('createdAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    table
      .timestamp('updatedAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
  });

  // City
  await knex.schema.createTable('City', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .notNullable();
    table
      .uuid('stateId')
      .notNullable()
      .references('id')
      .inTable('State')
      .index();
    table.string('name').notNullable().index();
    table.specificType('center', 'point').notNullable();
    table
      .specificType('centerGeog', 'geography')
      .notNullable()
      .index('city_centergeog_index', 'GIST');
    table.specificType('zoom', 'smallint').nullable();
    table
      .timestamp('createdAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    table
      .timestamp('updatedAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
  });

  // Activity
  await knex.schema.createTable('Activity', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .notNullable();
    table
      .specificType('activityTypeId', 'smallint')
      .notNullable()
      .references('id')
      .inTable('ActivityType')
      .index();
    table.string('name').notNullable();
    table.string('overview').notNullable();
    table.text('desc').notNullable();
    table.string('addressLine1').notNullable();
    table.specificType('location', 'point').notNullable();
    table
      .specificType('locationGeog', 'geography')
      .notNullable()
      .index('activity_locationgeog_index', 'GIST');
    table.specificType('price', 'smallint').notNullable().index();
    table
      .timestamp('createdAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    table
      .timestamp('updatedAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
  });

  // Property
  await knex.schema.createTable('Property', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .notNullable();
    table.uuid('cityId').notNullable().references('id').inTable('City').index();
    table.boolean('corporateDiscount').notNullable().index();
    table.string('sabreId').notNullable().unique();
    table.string('name').notNullable();
    table.text('desc').notNullable();
    table.string('addressLine1').notNullable();
    table.string('zipCode').notNullable();
    table.string('neighborhood').notNullable();
    table.decimal('romingoScore', 4, 2).notNullable().index();
    table
      .specificType('dogAmenities', 'smallint[]')
      .defaultTo('{}')
      .notNullable();
    table.string('featuredImageFilename').notNullable();
    table
      .specificType('imageFilenames', 'varchar(255)[]')
      .defaultTo('{}')
      .notNullable();
    table.boolean('blocked').notNullable().index();
    table
      .timestamp('createdAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    table
      .timestamp('updatedAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
  });

  // Booking
  await knex.schema.createTable('Booking', (table) => {
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
    table.string('paymentIntentId').notNullable().unique();
    table.string('cardId').notNullable().unique();
    table.string('sabreConfirmationId').notNullable().unique();
    table.string('propertyConfirmationId').notNullable().unique();
    table.string('faunaDocId').nullable().unique();
    table.string('firstName').notNullable().index();
    table.string('lastName').notNullable().index();
    table.string('email').notNullable().index();
    table
      .specificType('mobileCountryCallingCode', 'smallint')
      .notNullable()
      .index();
    table.string('mobileNumber').notNullable().index();
    table.timestamp('checkInAtLocal', { useTz: false }).notNullable().index();
    table.timestamp('checkOutAtLocal', { useTz: false }).notNullable().index();
    table.jsonb('data').notNullable();
    table.jsonb('charges').defaultTo({ total: 0, data: [] }).notNullable();
    table
      .timestamp('createdAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    table
      .timestamp('updatedAt', { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
  });
}

module.exports = {
  createTables,
};
