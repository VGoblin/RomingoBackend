exports.up = function(knex) {
    return knex.schema.table('Property', (table) => {
        table.specificType('allows_big_dogs', 'int').nullable().defaultTo(0);
    });
};

exports.down = function(knex) {
    return knex.schema.table('Property', (table) => {
        table.dropColumn('allows_big_dogs');
    });
};