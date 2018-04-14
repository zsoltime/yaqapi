'use strict';

const express = require('express');

const authorRoutes = require('./authors');
const categoryRoutes = require('./categories');
const notFound = require('./notFound');

const router = express.Router();

router.use('/authors', authorRoutes);
router.use('/categories', categoryRoutes);
router.use(notFound);

module.exports = router;
