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

  const bbox = (req.query.bbox || '')
    .split(',')
    .map(coordinate => parseFloat(coordinate, 10))
    .filter(coordinate => !isNaN(coordinate));

  // Validate bbox parameter
  if (!(bbox.length === 4 || bbox.length === 0)) {
    return next(new HttpError('Missing or invalid bbox coordinates', 400));
  }

  const pathBuffer = Math.min(parseInt(req.query.path_buffer || 2000, 10), 4000);
  const pointBuffer = Math.min(parseInt(req.query.point_buffer || 10, 10), 1000);
  const limit = Math.min(parseInt(req.query.limit || 1, 10), 3);

  // Format bbox to propper PostgreSQL array
  const bboxPgArr = `{${bbox.join(',')}}`;

  const sql = pg.SQL`
    SELECT
      cost,
      ST_AsGeoJSON(ST_Transform(geom, 4326)) as geometry
    FROM path(
      ${source[0]}::double precision,
      ${source[1]}::double precision,
      ${target[0]}::double precision,
      ${target[1]}::double precision,
      path_buffer:=${pathBuffer}::integer,
      point_buffer:=${pointBuffer}::integer,
      bbox:=${bboxPgArr}::double precision[],
      targets:=${limit}::integer
    )
    LIMIT ${limit};
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
