exports.up = function(knex) {
    return knex.schema.table('Booking', (table) => {
        table.specificType('cancellationFeePrice', 'float').nullable().defaultTo(0);
    });
};

exports.down = function(knex) {
    return knex.schema.table('Booking', (table) => {
        table.dropColumn('cancellationFeePrice');
    });
};