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

  it('returns route from Selhamar to Åsedalen', done => {
    app.get(`/api/v1/routing?coords=${selhamar},${åsedalen}`)
      .expect(200)
      .expect(nonEmptyGeometryCollection)
      .expect(res => {
        assert(res.body.geometries[0].properties.cost > 10000);
      })
      .end(done);
  });

  it('returns route from Selhamar to Solrenningen', done => {
    app.get(`/api/v1/routing?coords=${selhamar},${solrenningen}`)
      .expect(200)
      .expect(nonEmptyGeometryCollection)
      .expect(res => {
        assert(res.body.geometries[0].properties.cost > 20000);
      })
      .end(done);
  });

  it('returns route from Selhamar to Norddalen', done => {
    app.get(`/api/v1/routing?coords=${selhamar},${norddalen}`)
      .expect(200)
      .expect(nonEmptyGeometryCollection)
      .expect(res => {
        assert(res.body.geometries[0].properties.cost > 30000);
      })
      .end(done);
  });

  it('returns line whene no route endpoint is found', done => {
    const start = '8.991451263427734,61.496164239996375';
    const stop = '8.947162628173828,61.4678070658287';

    app.get(`/api/v1/routing?coords=${start},${stop}`)
      .expect(200)
      .expect(emptyGeometryCollection)
      .expect(res => {
        assert.deepEqual(res.body.coordinates, [
          [8.991451263427734, 61.496164239996375],
          [8.947162628173828, 61.4678070658287],
        ]);
      })
      .end(done);
  });

  it('applies custom snapping sensitivity', done => {
    const start = '8.922786712646484,61.5062387475475';
    const stop = '8.97857666015625,61.50984184413987';

    const sensitivity = '50';

    app.get(`/api/v1/routing?coords=${start},${stop}&sensitivity=${sensitivity}`)
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

  it('returns route in correct direction', done => {
    const start = '10.144715309143066,59.82439292924618';
    const stop = '10.170164108276367,59.82230042984233';

    app.get(`/api/v1/routing?coords=${start},${stop}`)
      .expect(200)
      .expect(nonEmptyGeometryCollection)
      .expect(res => {
        assert.deepEqual(res.body.geometries[0].coordinates[0], [
          10.1446959421948,
          59.8243679990877,
        ]);
      })
      .end(done);
  });
});
