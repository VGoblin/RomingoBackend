exports.up = function(knex) {
    return knex.schema.table('Property', (table) => {
        table.string('hotelEmail').nullable();
        table.string('hotelAlternativeEmail').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('Property', (table) => {
        table.dropColumn('hotelEmail');
        table.dropColumn('hotelAlternativeEmail');
    });
};