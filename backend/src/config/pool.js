const { Pool } = require('pg');
const { database } = require('./database');

const pool = new Pool({
  host: database.host,
  port: database.port,
  database: database.database,
  user: database.user,
  password: database.password,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = { pool };