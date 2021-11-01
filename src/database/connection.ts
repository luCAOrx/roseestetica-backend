import knex from 'knex';
const configuration = require('../../knexfile');

const config = process.env.DATABASE_ENV === 'production' ? configuration.production : configuration.development;

const connection = knex(config);

export default connection;