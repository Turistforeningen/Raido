'use strict';

process.env.NODE_ENV = 'test';
process.env.CORS_ALLOW_ORIGINS = 'example1.com,example2.com';
process.env.CORS_EXPOSE_HEADERS = 'x-response-time';
process.env.CORS_REQUIRE_ORIGIN = 'true';
