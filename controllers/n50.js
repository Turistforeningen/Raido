'use strict';

const express = require('express').Router;
const pg = require('../lib/pg');
const app = express();

const HttpError = require('@starefossen/http-error');

app.get('/routing', (req, res, next) => {
  if (!req.query.coords || req.query.coords.split(',').length !== 4) {
    return next(new HttpError('Missing or invalid "coords" query', 400));
  }

  // Make sure all the coords are float values
  const coords = req.query.coords.split(',').map(c => parseFloat(c, 10));

  const sensitivity = Math.min(parseInt(req.query.sensitivity || 2000, 10), 4000);

  const sql = `
    SELECT
      ST_AsGeoJSON(ST_Transform(geom, 4326)) as geojson, cost
    FROM path(${coords.join(',')}, ${sensitivity})
    LIMIT 1;
  `;

  return pg.query(sql, (err, result) => {
    if (err) { return next(new HttpError('Database Query Failed', 500, err)); }

    if (!result.rows.length || !result.rows[0].geojson) {
      return res.json({ type: 'LineString', coordinates: [
        [coords[0], coords[1]],
        [coords[2], coords[3]],
      ] });
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
