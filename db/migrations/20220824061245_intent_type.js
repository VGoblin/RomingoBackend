exports.up = function(knex) {
    return knex.schema.table('Booking', (table) => {
        table.string('intentType').nullable();
        table.jsonb('setupIntentObject').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('Booking', (table) => {
        table.dropColumn('intentType');
        table.dropColumn('setupIntentObject');
    });
};