'use strict';

const assert = require('assert');
const request = require('supertest');
const app = request(require('../../'));

function nonEmptyGeometryCollection(res) {
  assert.equal(res.body.type, 'GeometryCollection');
  assert.equal(res.body.geometries.length, 1);
}

function emptyGeometryCollection(res) {
  assert.equal(res.body.type, 'LineString');
  assert.equal(res.body.coordinates.length, 2);
}

describe('GET /routing', () => {
  const selhamar = '6.26297,60.91346';
  const åsedalen = '6.22052,60.96570';
  const solrenningen = '6.13070,61.00885';
  const norddalen = '5.99652,61.01511';

  it('returns route from Selhamar to Åsedalen', function it(done) {
    this.timeout(60000);

    app.get(`/routing?coords=${selhamar},${åsedalen}`)
      .set('Origin', 'https://example1.com')
      .expect(200)
      .expect(nonEmptyGeometryCollection)
      .expect(res => {
        assert(res.body.geometries[0].properties.cost > 10000);
      })
      .end(done);
  });

  it('returns route from Selhamar to Solrenningen', function it(done) {
    this.timeout(60000);

    app.get(`/routing?coords=${selhamar},${solrenningen}`)
      .set('Origin', 'https://example1.com')
      .expect(200)
      .expect(nonEmptyGeometryCollection)
      .expect(res => {
        assert(res.body.geometries[0].properties.cost > 20000);
      })
      .end(done);
  });

  it('returns route from Selhamar to Norddalen', function it(done) {
    this.timeout(60000);

    app.get(`/routing?coords=${selhamar},${norddalen}`)
      .set('Origin', 'https://example1.com')
      .expect(200)
      .expect(nonEmptyGeometryCollection)
      .expect(res => {
        assert(res.body.geometries[0].properties.cost > 30000);
      })
      .end(done);
  });

  it('returns line whene no route endpoint is found', function it(done) {
    this.timeout(60000);

    const start = '2.87842,60.79134';
    const stop = '0.08789,61.83541';

    app.get(`/routing?coords=${start},${stop}`)
      .set('Origin', 'https://example1.com')
      .expect(200)
      .expect(emptyGeometryCollection)
      .expect(res => {
        assert.deepEqual(res.body.coordinates, [
          [2.87842, 60.79134],
          [0.08789, 61.83541],
        ]);
      })
      .end(done);
  });

  it('applies custom snapping sensitivity', function it(done) {
    this.timeout(60000);

    const start = '8.922786712646484,61.5062387475475';
    const stop = '8.97857666015625,61.50984184413987';

    const sensitivity = '50';

    app.get(`/routing?coords=${start},${stop}&sensitivity=${sensitivity}`)
      .set('Origin', 'https://example1.com')
      .expect(200)
      .expect(emptyGeometryCollection)
      .expect(res => {
        assert.deepEqual(res.body.coordinates, [
          [8.922786712646484, 61.5062387475475],
          [8.97857666015625, 61.50984184413987],
        ]);
      })
      .end(done);
  });

  it('returns route in correct direction', function it(done) {
    this.timeout(60000);

    const start = '10.144715309143066,59.82439292924618';
    const stop = '10.170164108276367,59.82230042984233';

    app.get(`/routing?coords=${start},${stop}`)
      .set('Origin', 'https://example1.com')
      .expect(200)
      .expect(nonEmptyGeometryCollection)
      .expect(res => {
        assert.deepEqual(res.body.geometries[0].coordinates[0], [
          10.1446959429242,
          59.8243680000267,
        ]);
      })
      .end(done);
  });
});
