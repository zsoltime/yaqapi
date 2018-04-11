const express = require('express');
const validate = require('express-validation');

const authorController = require('../controllers/authors');
const validations = require('./validation/authors');

const router = express.Router();

router
  .route('/')
  .get(authorController.list)
  .post(validate(validations.createAuthor), authorController.create);

router
  .route('/:authorId')
  .get(authorController.get)
  .put(validate(validations.updateAuthor), authorController.update)
  .delete(authorController.remove);

router
  .route('/search/:query/:num?')
  .get(validate(validations.search), authorController.search);

router.param('authorId', validate(validations.getAuthor));
router.param('authorId', authorController.load);

module.exports = router;
