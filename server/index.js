'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const { db, port } = require('./config');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./middlewares/logger');
const routes = require('./routes');

const app = express();

app.use(logger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(db);
mongoose.connection.on('error', () => {
  throw new Error(`Unable to connect to database: ${db}`);
});
mongoose.connection.on('connected', () => {
  // eslint-disable-next-line no-console
  console.log(`Connected to database: ${db}`);
});

app.use('/api', routes);
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send({
    status: 'OK',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log('API is running http://localhost:%s', port);
  });
}

module.exports = app;
