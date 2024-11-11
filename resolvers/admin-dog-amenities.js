// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

function adminDogAmenities() {
  return pg.adminDogAmenities();
}

module.exports = {
  adminDogAmenities,
};
