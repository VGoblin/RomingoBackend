// om namah shivaya

'use strict';

// npx knex migrate:make 000
// npx knex migrate:latest
// NODE_ENV=production npx knex migrate:latest
module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '35.243.194.141',
      port: '5432',
      user: 'dev',
      password: "E2=2q;8NxEH:'}u6",
      database: 'romingo-development',
    },
    migrations: {
      directory: './db/migrations',
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: '104.196.101.94',
      port: '5432',
      user: 'user',
      password: 'password',
      database: 'romingo-production',
    },
    migrations: {
      directory: './db/migrations',
    },
  },
};
