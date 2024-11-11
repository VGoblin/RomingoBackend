
exports.up = function(knex) {
    return knex.schema.table('Booking', (table) => {
        table.jsonb('modifyLog').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('Booking', (table) => {
        table.dropColumn('modifyLog');
    });
};