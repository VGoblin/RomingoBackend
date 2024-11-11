// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

async function adminCity(parent, args) {
  let city = await pg.adminCity(args.input.id);

  if (city) {
    city = {
      id: city.cityId,
      name: city.cityName,
      center: {
        latitude: city.center.y,
        longitude: city.center.x,
      },
      zoom: city.zoom,
      blocked: city.blocked,
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
  }

  return city;
}

module.exports = {
  adminCity,
};
