'use strict';

const HTTPStatus = require('http-status');

const Quote = require('../models/Quote');

module.exports.create = (req, res, next) => {
  Quote.create({
    quote: req.body.quote,
    author: req.body.author,
    categories: req.body.categories,
    keywords: req.body.keywords,
  }).then(savedQuote => res.json(savedQuote), err => next(err));
};

module.exports.list = (req, res, next) => {
  const { limit = 10, skip = 0 } = req.query;

  Quote.find()
    .skip(skip)
    .limit(limit)
    .populate('author', ['name', 'href'])
    .populate('categories', ['name', 'href'])
    .then(quotes => res.json(quotes), err => next(err));
};

module.exports.update = (req, res, next) => {
  const quote = req.dbQuote;

  Object.assign(quote, req.body);

  quote.save().then(() => res.json(quote), err => next(err));
};

module.exports.remove = (req, res, next) => {
  const quote = req.dbQuote;

  quote.remove().then(() => res.sendStatus(204), err => next(err));
};

module.exports.search = (req, res, next) => {
  const { limit = 10, skip = 0 } = req.query;
  const { query } = req.params;

  Quote.find({ $text: { $search: query } })
    .skip(skip)
    .limit(limit)
    .populate('author', ['name', 'href'])
    .populate('categories', ['name', 'href'])
    .then(quotes => res.json(quotes), err => next(err));
};

module.exports.get = (req, res) => res.json(req.dbQuote);

module.exports.load = (req, res, next, id) => {
  Quote.findById(id)
    .populate('author', ['name', 'href'])
    .populate('categories', ['name', 'href'])
    .then(
      (quote) => {
        if (quote) {
          req.dbQuote = quote;
          return next();
        }

        return res.status(404).json({
          status: 404,
          statusText: HTTPStatus[404],
          errors: [
            { messages: ['The resource requested does not exist'] },
          ],
        });
      },
      err => next(err)
    );
};
