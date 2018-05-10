'use strict';

describe.skip('Quote routes', () => {
  test('route GET / to controller.list');
  test('route POST / to controller.create');
  test('route GET /:quoteId to controller.get');
  test('route PUT /:quoteId to controller.update');
  test('route DELETE /:quoteId to controller.remove');
  test('route GET /search/:query to controller.search');
});
