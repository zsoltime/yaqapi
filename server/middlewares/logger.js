'use strict';

const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

function logger(req, res, next) {
  if (process.env.NODE_ENV === 'development') {
    return morgan('dev')(req, res, next);
  }

  if (process.env.NODE_ENV === 'production') {
    return morgan('common', {
      skip: (request, result) => result.statusCode < 400,
      stream: fs.createWriteStream(
        path.join(__dirname, '../../logs/access.log'),
        { flags: 'a' }
      ),
    })(req, res, next);
  }

  return next();
}

module.exports = logger;
