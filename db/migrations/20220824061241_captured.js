exports.up = function(knex) {
    return knex.schema.table('Booking', (table) => {
        table.specificType('captured', 'int').nullable().defaultTo(0);
    });
};

exports.down = function(knex) {
    return knex.schema.table('Booking', (table) => {
        table.dropColumn('captured');
    });
};