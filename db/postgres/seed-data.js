// om namah shivaya

'use strict';

// require scripts
const { knex } = require('./postgres.js');

async function seedData() {
  // safety check
  if (process.env.NODE_ENV === 'production') {
    throw new Error('seedData cannot run in production environment');
  }

  await seedActivityType();
  await seedDogAmenity();
  await seedCountry();
  await seedState();
  await seedCity();
  await seedActivity();
  await seedProperty();
}

async function seedActivityType() {
  const data = require('../data/activity-type.json');
  console.table(data);
  await knex.batchInsert('ActivityType', data, data.length);
}

async function seedDogAmenity() {
  const data = require('../data/dog-amenity.json');
  console.table(data);
  await knex.batchInsert('DogAmenity', data, data.length);
}

async function seedCountry() {
  const data = require('../data/country.json');
  console.table(data);
  await knex.batchInsert('Country', data, data.length);
}

async function seedState() {
  const data = require('../data/state.json');
  console.table(data);
  await knex.batchInsert('State', data, data.length);
}

async function seedCity() {
  const data = require('../data/city.json');
  console.table(data);
  const newData = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    newData.push({
      id: row.id,
      stateId: row.stateId,
      name: row.name,
      center: knex.raw(
        `point(${row.center.longitude}, ${row.center.latitude})`
      ),
      centerGeog: knex.raw(
        `ST_MakePoint(${row.center.longitude}, ${row.center.latitude})`
      ),
      zoom: row.zoom,
    });
  }
  await knex.batchInsert('City', newData, newData.length);
}

async function seedActivity() {
  const data = require('../data/activity.json');
  console.table(data);
  const newData = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    newData.push({
      id: row.id,
      activityTypeId: row.activityTypeId,
      name: row.name,
      overview: row.overview,
      desc: row.desc,
      addressLine1: row.addressLine1,
      location: knex.raw(
        `point(${row.location.longitude}, ${row.location.latitude})`
      ),
      locationGeog: knex.raw(
        `ST_MakePoint(${row.location.longitude}, ${row.location.latitude})`
      ),
      price: row.price,
    });
  }
  await knex.batchInsert('Activity', newData, newData.length);
}

async function seedProperty() {
  let data;
  if (process.env.NODE_ENV === 'production') {
    data = require('../data/property.prod.json');
  } else {
    data = require('../data/property.json');
  }
  console.table(data);
  await knex.batchInsert('Property', data, data.length);
}

module.exports = {
  seedData,
};
