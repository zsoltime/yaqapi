'use strict';

describe.skip('Author routes', () => {
  test('route GET / to controller.list');
  test('route POST / to controller.create');
  test('route GET /:authorId to controller.get');
  test('route PUT /:authorId to controller.update');
  test('route DELETE /:authorId to controller.remove');
  test('route GET /search/:query to controller.search');
});
