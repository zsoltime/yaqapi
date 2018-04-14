'use strict';

const express = require('express');
const validate = require('express-validation');

const { authors } = require('../controllers');
const validations = require('./validation/authors');

const router = express.Router();

router
  .route('/')
  .get(authors.list)
  .post(validate(validations.createAuthor), authors.create);

router
  .route('/:authorId')
  .get(authors.get)
  .put(validate(validations.updateAuthor), authors.update)
  .delete(authors.remove);

router
  .route('/search/:query/:num?')
  .get(validate(validations.search), authors.search);

router.param('authorId', validate(validations.getAuthor));
router.param('authorId', authors.load);

module.exports = router;
