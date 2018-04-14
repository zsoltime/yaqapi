'use strict';

const express = require('express');
const HTTPStatus = require('http-status');

const authorRoutes = require('./authors');

const router = express.Router();

router.use('/authors', authorRoutes);

router.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    statusText: HTTPStatus[404],
  });
});

module.exports = router;
