'use strict';

const request = require('supertest');
const app = request(require('../../'));

describe('GET /', () => {
  it('returns 404 for index', done => {
    app.get('/').expect(404, done);
  });

  it('reject invalid cors domain', done => {
    app.get('/')
      .set('Origin', 'https://invalid.com')
      .expect(403)
      .expect({
        code: 403,
        message: 'Bad Origin "https://invalid.com"',
      }, done);
  });
});
