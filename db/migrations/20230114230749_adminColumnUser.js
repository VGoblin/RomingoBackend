exports.up = function(knex) {
  return knex.schema.table('Users', (table) => {
      table.boolean('isAdmin').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('Users', (table) => {
      table.dropColumn('isAdmin');
  });
};
