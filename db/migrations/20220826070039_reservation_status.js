
exports.up = function(knex) {
    return knex.schema.table('Booking', (table) => {
        table.string('reservationStatus').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('Booking', (table) => {
        table.dropColumn('reservationStatus');
    });
};
