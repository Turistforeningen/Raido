'use strict';

const pg = require('pg');

module.exports = new pg.Client('postgres://postgres:@postgres/postgres');
