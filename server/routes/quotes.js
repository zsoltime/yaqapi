'use strict';

const express = require('express');
const validate = require('express-validation');

const { quotes } = require('../controllers');
const validations = require('./validation/quotes');

const router = express.Router();

router
  .route('/')
  .get(quotes.list)
  .post(validate(validations.createQuote), quotes.create);

router
  .route('/:quoteId')
  .get(quotes.get)
  .put(validate(validations.updateQuote), quotes.update)
  .delete(quotes.remove);

router
  .route('/search/:query/:num?')
  .get(validate(validations.search), quotes.search);

router.param('quoteId', validate(validations.getQuote));
router.param('quoteId', quotes.load);

module.exports = router;
