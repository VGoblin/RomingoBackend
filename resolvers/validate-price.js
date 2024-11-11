// om namah shivaya

'use strict';

// require scripts
const sabre = require('../sabre/sabre.js');

async function validatePrice(parent, args) {
  let res = await sabre.validatePrice(args.input.priceKey);

  return res;
}

module.exports = {
  validatePrice,
};
