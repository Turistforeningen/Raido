'use strict';

const Client = require('raven').Client;

module.exports = new Client(process.env.SENTRY_DSN);

/* istanbul ignore next */
if (process.env.SENTRY_DSN) {
  module.exports.patchGlobal((id, err) => {
    /* eslint-disable no-console */
    console.error('Uncaught Exception');
    console.error(err.message);
    console.error(err.stack);
    /* eslint-enable */
    process.exit(1);
  });
}
