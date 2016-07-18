'use strict';
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const assert = require('assert');
const request = require('supertest');
const app = request(require('../../'));

function geometryCollections(n) {
  return res => {
    assert.equal(res.body.type, 'GeometryCollection');
    assert.equal(res.body.geometries.length, n);
  };
}

function missingOrInvalidCoorinates(res) {
  assert.deepEqual(res.body, {
    code: 400,
    message: 'Missing or invalid coordinates',
  });
}

function routeApproxCost(cost, margin) {
  return res => {
    res.body.geometries.forEach(geometry => {
      assert(geometry.properties.cost > cost * (1 - margin));
      assert(geometry.properties.cost < cost * (1 + margin));
    });
  };
}

const points = {
  cabin: {
    selhamar: '6.26297,60.91346',
    åsedalen: '6.22052,60.96570',
    solrenningen: '6.13070,61.00885',
    norddalen: '5.99652,61.01511',
  },
  point: {
    '200m-off-trail': '6.28474,60.93403',
    'north-of-vardadalsbu': '5.86807,60.95240',
    'south-of-vardadalsbu': '5.86773,60.92030',
  },
};

describe('GET /routing', () => {
  const url = '/routing';

  [
    undefined,
    null,
    '',
    '1.1',
    '1.1,abc',
    'abc,2.2',
    '1.1,2.2,3.3',
  ].forEach(param => {
    const valid = points.cabin.selhamar;

    it(`returns 400 error for source="${param}"`, function it(done) {
      this.timeout(60000);

      app.get(`/routing?source=${param}&target=${valid}`)
        .expect(400)
        .expect(missingOrInvalidCoorinates)
        .end(done);
    });

    it(`returns 400 error for target="${param}"`, function it(done) {
      this.timeout(60000);

      app.get(`/routing?source=${valid}&target=${param}`)
        .expect(400)
        .expect(missingOrInvalidCoorinates)
        .end(done);
    });
  });

  [{
    source: 'Selhamar',
    target: 'Åsedalen',
    cost: 13000,
  }, {
    source: 'Selhamar',
    target: 'Solrenningen',
    cost: 26000,
  }, {
    source: 'Selhamar',
    target: 'Norddalen',
    cost: 35000,
  }].forEach(({ source: sourceName, target: targetName, cost }) => {
    it(`returns route from ${sourceName} to ${targetName}`, function it(done) {
      this.timeout(60000);

      const source = points.cabin[sourceName.toLowerCase()];
      const target = points.cabin[targetName.toLowerCase()];

      app.get(`/routing?source=${source}&target=${target}`)
        .expect(200)
        .expect(geometryCollections(1))
        .expect(routeApproxCost(cost, 0.1))
        .end(done);
    });
  });

  it('returns empty GeometryCollection for no route', function it(done) {
    this.timeout(60000);

    const source = points.point['north-of-vardadalsbu'];
    const target = points.point['south-of-vardadalsbu'];

    app.get(`${url}?source=${source}&target=${target}&path_buffer=1000`)
      .expect(200)
      .expect(geometryCollections(0))
      .end(done);
  });

  it('returns route when path buffer is high enough', function it(done) {
    this.timeout(60000);

    const source = points.point['north-of-vardadalsbu'];
    const target = points.point['south-of-vardadalsbu'];

    app.get(`${url}?source=${source}&target=${target}&path_buffer=4000`)
      .expect(200)
      .expect(geometryCollections(1))
      .end(done);
  });

  it('returns empty GeometryCollection for no source', function it(done) {
    this.timeout(60000);

    const source = points.point['200m-off-trail'];
    const target = points.cabin.selhamar;

    app.get(`${url}?source=${source}&target=${target}`)
      .expect(200)
      .expect(geometryCollections(0))
      .end(done);
  });

  it('finds source with higher point buffer', function it(done) {
    this.timeout(60000);

    const source = points.point['200m-off-trail'];
    const target = points.cabin.selhamar;

    app.get(`${url}?source=${source}&target=${target}&point_buffer=1000`)
      .expect(200)
      .expect(geometryCollections(1))
      .end(done);
  });

  it('returns empty GeometryCollection for no target', function it(done) {
    this.timeout(60000);

    const source = points.cabin.selhamar;
    const target = points.point['200m-off-trail'];

    app.get(`${url}?source=${source}&target=${target}`)
      .expect(200)
      .expect(geometryCollections(0))
      .end(done);
  });

  it('finds target with higher point buffer', function it(done) {
    this.timeout(60000);

    const source = points.cabin.selhamar;
    const target = points.point['200m-off-trail'];

    app.get(`${url}?source=${source}&target=${target}&point_buffer=1000`)
      .expect(200)
      .expect(geometryCollections(1))
      .end(done);
  });

  it('returns route in correct direction', function it(done) {
    this.timeout(60000);

    const source = points.cabin.selhamar;
    const target = points.cabin.norddalen;

    app.get(`/routing?source=${source}&target=${target}`)
      .expect(200)
      .expect(geometryCollections(1))
      .end((err1, res1) => {
        assert.ifError(err1);

        const line1 = res1.body.geometries[0].geometry.coordinates;

        app.get(`/routing?source=${target}&target=${source}`)
          .expect(200)
          .expect(geometryCollections(1))
          .expect(res2 => {
            const line2 = res2.body.geometries[0].geometry.coordinates.reverse();

            assert.deepEqual(line1, line2);
          })
          .end(done);
      });
  });

  it('returns route for bbox bounding box buffer', function it(done) {
    this.timeout(60000);

    const source = points.cabin.selhamar;
    const target = points.cabin.norddalen;
    const bbox = [5.41213, 60.87099, 6.59591, 61.07090].join(',');

    app.get(`/routing?source=${source}&target=${target}&bbox=${bbox}&path_buffer=0`)
      .expect(200)
      .expect(geometryCollections(1))
      .expect(routeApproxCost(35000, 0.1))
      .end(done);
  });

  it('returns multiple shortes path routes', function it(done) {
    this.timeout(60000);

    const source = points.cabin.selhamar;
    const target = points.cabin.åsedalen;

    app.get(`/routing?source=${source}&target=${target}&limit=3`)
      .expect(200)
      .expect(geometryCollections(2))
      .expect(routeApproxCost(13000, 0.1))
      .end(done);
  });
});
