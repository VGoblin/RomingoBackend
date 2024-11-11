
exports.up = function(knex) {
    return knex.schema.table('Property', (table) => {
        table.string('alias').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('Property', (table) => {
        table.dropColumn('alias');
    });
};
