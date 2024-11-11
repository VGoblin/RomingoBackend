// om namah shivaya

'use strict';

function hello(parent, args) {
  return {
    message: `Hello ${args.input.name}!`,
  };
}

module.exports = {
  hello,
};
