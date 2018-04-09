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
  const regex = new RegExp(req.params.query.replace(/(?=\W)/g, '\\'), 'i');

  Author.find({ name: { $regex: regex } })
    .exec()
    .then(authors => res.json(authors), err => next(err));
};

module.exports.get = (req, res) => res.json(req.dbAuthor);

module.exports.load = (req, res, next, id) => {
  Author.findById(id)
    .exec()
    .then(
      (author) => {
        req.dbAuthor = author;
        return next();
      },
      err => next(err)
    );
};
