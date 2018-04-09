const express = require('express');
const authorController = require('../controllers/authors');

const router = express.Router();

router
  .route('/')
  .get(authorController.list)
  .post(authorController.create);

router
  .route('/:authorId')
  .get(authorController.get)
  .put(authorController.update)
  .delete(authorController.remove);

router.route('/search/:query/:num?').get(authorController.search);

router.param('authorId', authorController.load);

module.exports = router;
