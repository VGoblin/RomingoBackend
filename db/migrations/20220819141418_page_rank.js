
exports.up = function(knex) {
    return knex.schema.table('Property', (table) => {
        table.specificType('page_rank', 'int').nullable().defaultTo(10);
    });
};

exports.down = function(knex) {
    return knex.schema.table('Property', (table) => {
        table.dropColumn('page_rank');
    });
};
