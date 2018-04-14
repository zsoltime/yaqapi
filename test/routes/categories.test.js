'use strict';

describe.skip('Category routes', () => {
  test('route GET / to controller.list');
  test('route POST / to controller.create');
  test('route GET /:categoryId to controller.get');
  test('route PUT /:categoryId to controller.update');
  test('route DELETE /:categoryId to controller.remove');
  test('route GET /search/:query to controller.search');
});
