// om namah shivaya

'use strict';

// require scripts
const pg = require('../db/postgres/postgres.js');

async function adminUpdatePropertyTitle(parent, args) {
  const [id] = await pg.adminUpdatePropertyTitle(
    args.id,
    args.alias,
  );
  return {
    id,
  };
}

module.exports = {
  adminUpdatePropertyTitle,
};
