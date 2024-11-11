// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

async function adminUpdateCity(parent, args) {
  const [id] = await pg.adminUpdateCity(
    args.input.id,
    args.input.stateId,
    args.input.name,
    args.input.center.latitude,
    args.input.center.longitude,
    args.input.zoom,
    args.input.blocked
  );

  return {
    id,
  };
}

module.exports = {
  adminUpdateCity,
};
