// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

function adminCountries() {
  return pg.adminCountries();
}

module.exports = {
  adminCountries,
};
