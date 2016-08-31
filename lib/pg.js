'use strict';

const pg = require('pg');

const opts = {
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_DATABASE || 'postgres',
  host: process.env.POSTGRES_PORT_5432_TCP_ADDR || 'postgres',
  port: process.env.POSTGRES_PORT_5432_TCP_PORT || 5432,
};

module.exports = new pg.Client(opts);

module.exports.SQL = function SQL(parts, ...values) {
  return {
    text: parts.reduce((prev, curr, i) => `${prev}\$${i}${curr}`),
    values,
  };
};
