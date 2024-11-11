// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

function adminProperty(parent, args) {
  return pg.adminProperty(args.input.id);
}

module.exports = {
  adminProperty,
};
