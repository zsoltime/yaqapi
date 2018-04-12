const HTTPStatus = require('http-status');

const Author = require('../models/Author');

module.exports.create = (req, res, next) => {
  Author.create({
    name: req.body.name,
    image: req.body.image,
    nationality: req.body.nationality,
    profession: req.body.profession,
  }).then(savedAuthor => res.json(savedAuthor), err => next(err));
};

module.exports.list = (req, res, next) => {
  const { limit = 10, skip = 0 } = req.query;

  Author.find()
    .skip(skip)
    .limit(limit)
    .exec()
    .then(authors => res.json(authors), err => next(err));
};

module.exports.update = (req, res, next) => {
  const author = req.dbAuthor;

  Object.assign(author, req.body);

  author.save().then(() => res.json(author), err => next(err));
};

module.exports.remove = (req, res, next) => {
  const author = req.dbAuthor;

  author.remove().then(() => res.sendStatus(204), err => next(err));
};

module.exports.search = (req, res, next) => {
  const { limit = 10, skip = 0 } = req.query;
  const regex = new RegExp(req.params.query.replace(/(?=\W)/g, '\\'), 'i');

  Author.find({ name: { $regex: regex } })
    .skip(skip)
    .limit(limit)
    .exec()
    .then(authors => res.json(authors), err => next(err));
};

module.exports.get = (req, res) => res.json(req.dbAuthor);

module.exports.load = (req, res, next, id) => {
  Author.findById(id)
    .exec()
    .then(
      author => {
        if (author) {
          req.dbAuthor = author;
          return next();
        }

        return res.status(404).json({
          status: 404,
          statusText: HTTPStatus[404],
          errors: [{ messages: ['The resource requested does not exist'] }],
        });
      },
      err => next(err)
    );
};
