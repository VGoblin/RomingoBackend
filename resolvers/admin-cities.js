// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

function adminCities(parent, args) {
  return pg.adminCities(args.input.stateId);
}

module.exports = {
  adminCities,
};
