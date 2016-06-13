'use strict';

const pg = require('pg');

module.exports = new pg.Client('postgres://postgres:@postgres/postgres');

module.exports.SQL = function SQL(parts, ...values) {
  return {
    text: parts.reduce((prev, curr, i) => prev+"$"+i+curr),
    values
  };
}
