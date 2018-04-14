'use strict';

const express = require('express');

const authorRoutes = require('./authors');
const notFound = require('./notFound');

const router = express.Router();

router.use('/authors', authorRoutes);
router.use(notFound);

module.exports = router;
