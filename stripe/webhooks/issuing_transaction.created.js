// om namah shivaya

'use strict';

// require scripts
const pg = require('../../db/postgres/postgres.js');

function receive(event) {
  return pg.updateCharges(
    event.data.object.id,
    event.data.object.card,
    event.data.object.amount
  );
}

module.exports = {
  receive,
};
