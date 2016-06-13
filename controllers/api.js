'use strict';

const express = require('express').Router;
const pg = require('../lib/pg');
const app = express();

const HttpError = require('@starefossen/http-error');

app.get('/routing', (req, res, next) => {
  // Convert all coordinates to propper float values
  const source = (req.query.source || '')
    .split(',')
    .map(coordinate => parseFloat(coordinate, 10))
    .filter(coordinate => !isNaN(coordinate));

  const target = (req.query.target || '')
    .split(',')
    .map(coordinate => parseFloat(coordinate, 10))
    .filter(coordinate => !isNaN(coordinate));

  // Validate required source and target parameters
  if (source.length !== 2 || target.length !== 2) {
    return next(new HttpError('Missing or invalid coordinates', 400));
  }

  const pathBuffer = Math.min(parseInt(req.query.path_buffer || 1000, 10), 4000);
  const pointBuffer = Math.min(parseInt(req.query.point_buffer || 10, 10), 1000);

  const sql = pg.SQL`
    SELECT
      cost,
      ST_AsGeoJSON(ST_Transform(geom, 4326)) as geometry
    FROM path(
      ${source[0]}, ${source[1]},
      ${target[0]}, ${target[1]},
      path_buffer:=${pathBuffer},
      point_buffer:=${pointBuffer}
    )
    LIMIT 1;
  `;

  return pg.query(sql, (err, result) => {
    if (err) { return next(new HttpError('Database Query Failed', 500, err)); }

    const collection = {
      type: 'GeometryCollection',
      geometries: [],
    };

    if (!result.rows.length || !result.rows[0].geometry) {
      return res.json(collection);
    }

    result.rows.forEach((row) => {
      collection.geometries.push({
        type: 'Feature',
        geometry: JSON.parse(row.geometry),
        properties: { cost: row.cost },
      });
    });

    return res.json(collection);
  });
});

module.exports = app;
