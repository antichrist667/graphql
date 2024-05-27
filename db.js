const { Pool } = require('pg');

const pool = new Pool({
  user: 'cristiancaiza',
  host: 'postgresql-cristiancaiza.alwaysdata.net',
  database: 'cristiancaiza_db',
  password: 'postgres',
  port: 5432,
});

module.exports = { pool };
