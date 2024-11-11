
exports.up = function (knex) {
    return knex.schema.createTable('Users', function (table) {
        table
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'))
            .notNullable();
        table.string('email')
            .unique()
            .notNullable();
        table.string('password').notNullable();
        table.string('name').nullable();
        table.string('bio').nullable();
        table.string('location').nullable();
        table.string('token').nullable();
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
    return knex.schema.dropTable('Users');
};
