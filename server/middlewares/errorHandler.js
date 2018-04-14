'use strict';

const expressValidation = require('express-validation');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof expressValidation.ValidationError) {
    return res.status(err.status).json(err);
  }

  return res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || 'Internal Server Error',
  });
}

module.exports = errorHandler;
