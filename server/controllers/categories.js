'use strict';

const HTTPStatus = require('http-status');

const Category = require('../models/Category');

module.exports.create = (req, res, next) => {
  Category.create({
    name: req.body.name,
  }).then(savedCategory => res.json(savedCategory), err => next(err));
};

module.exports.list = (req, res, next) => {
  const { limit = 10, skip = 0 } = req.query;

  Category.find()
    .skip(skip)
    .limit(limit)
    .exec()
    .then(categories => res.json(categories), err => next(err));
};

module.exports.update = (req, res, next) => {
  const category = req.dbCategory;

  Object.assign(category, req.body);

  category.save().then(() => res.json(category), err => next(err));
};

module.exports.remove = (req, res, next) => {
  const category = req.dbCategory;

  category.remove().then(() => res.sendStatus(204), err => next(err));
};

module.exports.search = (req, res, next) => {
  const { limit = 10, skip = 0 } = req.query;
  const regex = new RegExp(
    req.params.query.replace(/(?=\W)/g, '\\'),
    'i'
  );

  Category.find({ name: { $regex: regex } })
    .skip(skip)
    .limit(limit)
    .exec()
    .then(categories => res.json(categories), err => next(err));
};

module.exports.get = (req, res) => res.json(req.dbCategory);

module.exports.load = (req, res, next, id) => {
  Category.findById(id)
    .exec()
    .then(
      (category) => {
        if (category) {
          req.dbCategory = category;
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
