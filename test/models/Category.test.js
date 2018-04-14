'use strict';

const Category = require('../../server/models/Category');

describe('Category model', () => {
  test('return an error if either name or slug is empty', (done) => {
    const category = new Category();

    category.validate().catch((err) => {
      expect(Object.keys(err.errors).length).toBe(2);
      expect(err.errors.name).toBeDefined();
      expect(err.errors.slug).toBeDefined();
      done();
    });
  });

  test('have a default slug', () => {
    const category = new Category({ name: 'Science' });

    expect(category.slug).toBe('science');
  });
});
