// Update with your config settings.
require('dotenv').config();

let CONNECTION_STRING = process.env.PG_DATABASE_URL + process.env.POSTGRES_DB;
console.log('Knex connection:', CONNECTION_STRING);

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'pg',
    connection: CONNECTION_STRING,
    migrations: {
      directory: "./db/migrations"
    },
    seeds: {
      directory: "./db/seeds"
    }
  }
};