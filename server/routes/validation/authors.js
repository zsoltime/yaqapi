'use strict';

const Joi = require('joi');

module.exports.createAuthor = {
  body: {
    name: Joi.string()
      .trim()
      .min(2)
      .regex(/^[-.\w\s]+$/i)
      .required(),
    slug: Joi.string()
      .min(2)
      .regex(/^[-a-z\d]+$/),
    image: Joi.string().uri({ allowRelative: true }),
    nationality: Joi.string(),
    profession: Joi.string(),
  },
};

module.exports.updateAuthor = {
  body: {
    name: Joi.string()
      .trim()
      .min(2)
      .regex(/^[-.\w\s]+$/i),
    slug: Joi.string()
      .min(2)
      .regex(/^[-a-z\d]+$/),
    image: Joi.string().uri({ allowRelative: true }),
    nationality: Joi.string(),
    profession: Joi.string(),
  },
};

module.exports.getAuthor = {
  params: {
    authorId: Joi.string()
      .regex(/^[a-f\d]{24}$/i)
      .required(),
  },
};

module.exports.search = {
  params: {
    query: Joi.string()
      .min(3)
      .required(),
  },
};
