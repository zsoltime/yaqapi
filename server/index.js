const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const routes = require('./routes');
const { db, port } = require('./config');

const app = express();

if (app.get('env') === 'development') {
  app.use(morgan('dev'));
  mongoose.set('debug', true);
} else {
  app.use(morgan('common', {
    skip: (req, res) => res.statusCode < 400,
    stream: `${__dirname}/../morgan.log`,
  }));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(db);
mongoose.connection.on('error', () => {
  throw new Error(`Unable to connect to database: ${db}`);
});
mongoose.connection.on('connected', () => {
  console.log(`Connected to database: ${db}`);
});

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send({
    status: 'OK',
  });
});

const server = app.listen(port, () => {
  console.log('API is running http://localhost:%s', port);
});

module.exports = { app, server };
