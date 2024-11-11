// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

async function adminCreateCity(parent, args) {
  const [id] = await pg.adminCreateCity(
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
  adminCreateCity,
};
