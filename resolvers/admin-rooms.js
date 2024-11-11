// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

function adminRooms(parent, args) {
  return pg.adminRooms(args.input.propertyId);
}

module.exports = {
  adminRooms,
};
