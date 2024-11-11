// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

async function adminProperties() {
  const properties = await pg.adminProperties();

  for (let i = 0; i < properties.length; i++) {
    let property = properties[i];

    property = {
      id: property.id,
      name: property.propertyName,
      city: {
        name: property.cityName,
      },
    };

    properties[i] = property;
  }

  return properties;
}

module.exports = {
  adminProperties,
};
