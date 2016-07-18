'use strict';
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const assert = require('assert');
const request = require('supertest');
const app = request(require('../../'));

describe('GET /CloudHealthCheck', () => {
  it('returns PostgreSQL status', done => {
    app.get('/CloudHealthCheck')
      .set('Origin', 'https://example2.com')
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
