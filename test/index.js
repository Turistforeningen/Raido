'use strict';

const pg = require('../lib/pg');

before(done => pg.connect(done));
