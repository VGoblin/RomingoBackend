exports.up = function(knex) {
    return knex.schema.table('Booking', (table) => {
        table.boolean('isReminderSent').nullable().defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('Booking', (table) => {
        table.dropColumn('isReminderSent');
    });
};