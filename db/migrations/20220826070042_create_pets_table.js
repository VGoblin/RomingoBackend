
exports.up = function (knex) {
    return knex.schema.createTable('Pets', function (table) {
        table
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'))
            .notNullable();
        table.uuid('userId')
            .nullable()
            .references('id')
            .inTable('Users')
            .index();
        table.string('petName').nullable()
        table.string('petDescription').nullable();
        table.string('breedType').nullable();
        table.jsonb('images').nullable();
        table
            .timestamp('createdAt', { useTz: true })
            .defaultTo(knex.fn.now())
            .notNullable();
        table
            .timestamp('updatedAt', { useTz: true })
            .defaultTo(knex.fn.now())
            .notNullable();
    })
};

exports.down = function (knex) {
    return knex.schema.dropTable('Pets');
};
