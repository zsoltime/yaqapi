'use strict';

const Joi = require('joi');

module.exports.createQuote = {
  body: {
    quote: Joi.string()
      .trim()
      .min(2)
      .required(),
    author: Joi.string()
      .trim()
      .regex(/^[a-f\d]{24}$/i)
      .required(),
    categories: Joi.array().items(
      Joi.string()
        .trim()
        .regex(/^[a-f\d]{24}$/i)
    ),
    keywords: Joi.array().items(Joi.string()),
  },
};

module.exports.updateQuote = {
  body: {
    quote: Joi.string()
      .trim()
      .min(2),
    author: Joi.string()
      .trim()
      .regex(/^[a-f\d]{24}$/i),
    categories: Joi.array().items(
      Joi.string()
        .trim()
        .regex(/^[a-f\d]{24}$/i)
    ),
    keywords: Joi.array().items(Joi.string()),
  },
};

module.exports.getQuote = {
  params: {
    quoteId: Joi.string()
      .trim()
      .regex(/^[a-f\d]{24}$/i)
      .required(),
  },
};

module.exports.search = {
  params: {
    query: Joi.string()
      .trim()
      .min(3)
      .required(),
  },
};
