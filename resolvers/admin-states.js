// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

function adminStates(parent, args) {
  return pg.adminStates(args.input.countryId);
}

module.exports = {
  adminStates,
};
