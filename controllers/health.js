'use strict';

const HttpError = require('@starefossen/http-error');
const healthCheck = require('@starefossen/express-health');
const pg = require('../lib/pg');

module.exports = healthCheck({
  name: 'PostgreSQL',
  check: cb => {
    const query = 'SELECT * FROM pg_stat_database WHERE datname=\'postgres\'';
    pg.query(query, (error, result) => {
      if (error) {
        cb(new HttpError('Postgres Query Failed', 500, error));
      } else {
        cb(null, result.rows[0]);
      }
    });
  },
});
