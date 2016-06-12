'use strict';

const express = require('express').Router;
const pg = require('../lib/pg');
const app = express();

const HttpError = require('@starefossen/http-error');

app.get('/routing', (req, res, next) => {
  if (!req.query.source || req.query.source.split(',').length !== 2
    || !req.query.target || req.query.target.split(',').length !== 2
  ) {
    return next(new HttpError('Missing or invalid coordinates', 400));
  }

  // Make sure all the coords are float values
  const source = req.query.source.split(',').map(c => parseFloat(c, 10));
  const target = req.query.target.split(',').map(c => parseFloat(c, 10));

  const path_buffer = Math.min(parseInt(req.query.path_buffer || 2000, 10), 4000);
  const point_buffer = Math.min(parseInt(req.query.point_buffer || 10, 10), 100);

  const sql = `
    SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson, cost
    FROM path(
      ${source.join(',')},
      ${target.join(',')},
      path_buffer:=${path_buffer},
      point_buffer:=${point_buffer}
    )
    LIMIT 1;
  `;

  return pg.query(sql, (err, result) => {
    if (err) { return next(new HttpError('Database Query Failed', 500, err)); }

    if (!result.rows.length || !result.rows[0].geojson) {
      return res.json({ type: 'LineString', coordinates: [source, target]});
    }

    const geojson = {
      type: 'GeometryCollection',
      geometries: [],
    };

    result.rows.forEach((row) => {
      const geometry = JSON.parse(row.geojson);
      geometry.properties = { cost: row.cost };

      geojson.geometries.push(geometry);
    });

    return res.json(geojson);
  });
});

module.exports = app;
