'use strict';

const Joi = require('joi');

module.exports.createCategory = {
  body: {
    name: Joi.string()
      .trim()
      .min(2)
      .regex(/^[a-z\s-.'&]+$/i)
      .required(),
    slug: Joi.string()
      .min(2)
      .regex(/^[-a-z]+$/),
  },
};

module.exports.updateCategory = {
  body: {
    name: Joi.string()
      .trim()
      .min(2)
      .regex(/^[a-z\s-.'&]+$/i),
    slug: Joi.string()
      .min(2)
      .regex(/^[-a-z]+$/),
  },
};

module.exports.getCategory = {
  params: {
    categoryId: Joi.string()
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
