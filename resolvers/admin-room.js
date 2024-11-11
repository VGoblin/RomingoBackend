// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

function adminRoom(parent, args) {
  return pg.adminRoom(args.input.id);
}

module.exports = {
  adminRoom,
};
