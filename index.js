'use strict';

if (process.env.NODE_ENV === 'production') {
  /* eslint-disable no-console */
  console.log('Starting newrelic application monitoring');
  /* eslint-enable */
  require('newrelic'); // eslint-disable-line global-require
}

const raven = require('raven');
const sentry = require('./lib/sentry');

const express = require('express');
const compression = require('compression');
const responseTime = require('response-time');
const corsHeaders = require('@starefossen/express-cors');
const HttpError = require('@starefossen/http-error');

const app = module.exports = express();
const pg = require('./lib/pg');

app.set('json spaces', 2);
app.set('x-powered-by', false);
app.set('etag', false);

app.use(compression());
app.use(responseTime());
app.use(corsHeaders.middleware);

app.all('/CloudHealthCheck', (req, res) => {
  res.status(200);

  if (req.method === 'HEAD') {
    return res.end();
  }

  return res.json({
    message: 'System OK',
  });
});

app.use('/api/v1', require('./controllers/n50'));
app.use((req, res, next) => next(new HttpError('Not Found', 404)));

app.use(raven.middleware.express.requestHandler(sentry));
app.use(raven.middleware.express.errorHandler(sentry));

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  /* eslint-disable no-console */
  if (err.code >= 500) {
    if (err.error) {
      console.error(err.error.message);
      console.error(err.error.stack);
    } else {
      console.error(err.message);
      console.error(err.stack);
    }
  }
  /* eslint-enable */

  res.status(err.code).json(err.toJSON());
});

if (!module.parent) {
  pg.connect(err => {
    if (err) { throw err; }

    /* eslint-disable no-console */
    console.log('Connected to Postgres Database');

    app.listen(process.env.VIRTUAL_PORT || 8080);
    console.log(`Server listening on port ${process.env.VIRTUAL_PORT || 8080}`);
    /* eslint-enable */
  });
}
