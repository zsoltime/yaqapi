'use strict';

const express = require('express');
const validate = require('express-validation');

const { categories } = require('../controllers');
const validations = require('./validation/categories');

const router = express.Router();

router
  .route('/')
  .get(categories.list)
  .post(validate(validations.createCategory), categories.create);

router
  .route('/:categoryId')
  .get(categories.get)
  .put(validate(validations.updateCategory), categories.update)
  .delete(categories.remove);

router
  .route('/search/:query/:num?')
  .get(validate(validations.search), categories.search);

router.param('categoryId', validate(validations.getCategory));
router.param('categoryId', categories.load);

module.exports = router;
