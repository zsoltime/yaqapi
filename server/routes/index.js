const express = require('express');

const authorRoutes = require('./authors');

const router = express.Router();

router.use('/authors', authorRoutes);

module.exports = router;
