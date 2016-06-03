'use strict';

const assert = require('assert');
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

describe('GET /CloudHealthCheck', () => {
  it('returns PostgreSQL status', done => {
    app.get('/CloudHealthCheck')
      .expect(200)
      .expect(res => {
        assert.equal(res.body.code, 200);
        assert.equal(res.body.message, 'Ok');
        assert.equal(res.body.services.length, 1);
        assert.equal(res.body.services[0].name, 'PostgreSQL');
        assert.equal(typeof res.body.services[0].status, 'object');
      })
      .end(done);
  });
});
