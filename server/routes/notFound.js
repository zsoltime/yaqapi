'use strict';

const HTTPStatus = require('http-status');

module.exports = (req, res) => {
  res.status(404).json({
    status: 404,
    statusText: HTTPStatus[404],
    errors: [{ messages: ['The URI requested is invalid'] }],
  });
};
