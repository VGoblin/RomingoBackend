
exports.up = function(knex) {
    return knex.schema.table('Property', (table) => {
        table.specificType('testing', 'int').nullable().defaultTo(1);
    });
};

exports.down = function(knex) {
    return knex.schema.table('Property', (table) => {
        table.dropColumn('testing');
    });
};
