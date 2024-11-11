// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

async function cities() {
  const cities = await pg.cities();

  for (let i = 0; i < cities.length; i++) {
    let city = cities[i];

    city = {
      id: city.cityId,
      name: city.cityName,
      center: {
        latitude: city.center.y,
        longitude: city.center.x,
      },
      zoom: city.zoom,
      state: {
        id: city.stateId,
        code: city.code,
        name: city.stateName,
        country: {
          id: city.countryId,
          name: city.countryName,
        },
      },
    };

    cities[i] = city;
  }

  return cities;
}

module.exports = {
  cities,
};
