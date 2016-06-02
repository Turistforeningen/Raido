'use strict';

const request = require('supertest');
const app = request(require('../../'));

describe('GET /', () => {
  it('returns 404 for index', done => {
    app.get('/').expect(404, done);
  });
});
