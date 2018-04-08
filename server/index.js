const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');

const app = express();
if (app.get('env') === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('common', {
    skip: (req, res) => res.statusCode < 400,
    stream: `${__dirname}/../morgan.log`,
  }));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send({
    status: 'OK',
  });
});

const server = app.listen(3000, () => {
  console.log('API is running http://localhost:%d', 3000);
});

module.exports = { app, server };
