'use strict';

/* istanbul ignore if */
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
const HttpError = require('@starefossen/http-error');

const app = module.exports = express();
const pg = require('./lib/pg');

app.set('json spaces', 2);
app.set('x-powered-by', false);
app.set('etag', false);

app.use(compression());
app.use(responseTime());

// Cors Headers
const corsHeaders = require('@starefossen/express-cors');
app.use(corsHeaders.middleware);

// Health Check
app.get('/CloudHealthCheck', require('./controllers/health'));

// Routing API
app.use(require('./controllers/api'));

// Not Found
app.use((req, res, next) => next(new HttpError('Not Found', 404)));

// Sentry error handler
app.use(raven.middleware.express.requestHandler(sentry));
app.use(raven.middleware.express.errorHandler(sentry));

// Final error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Wrap non-http errors
  if (!(err instanceof HttpError)) {
    err = new HttpError(err.message, 500, err); // eslint-disable-line no-param-reassign
  }

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

/* istanbul ignore if */
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
