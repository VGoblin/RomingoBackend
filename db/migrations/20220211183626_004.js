// om namah shivaya

'use strict';

exports.up = function (knex) {
  return knex.schema.table('Property', (table) => {
    table.string('listingsPagePromoText').nullable();
    table.string('detailsPagePromoText').nullable();
    table.string('checkoutPagePromoText').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('Property', (table) => {
    table.dropColumn('listingsPagePromoText');
    table.dropColumn('detailsPagePromoText');
    table.dropColumn('checkoutPagePromoText');
  });
};
