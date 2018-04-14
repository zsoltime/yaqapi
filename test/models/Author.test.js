'use strict';

const Author = require('../../server/models/Author');

describe('Author model', () => {
  test('return an error if either name or slug is empty', (done) => {
    const author = new Author();

    author.validate().catch((err) => {
      expect(Object.keys(err.errors).length).toBe(2);
      expect(err.errors.name).toBeDefined();
      expect(err.errors.slug).toBeDefined();
      done();
    });
  });

  test('have a default slug', () => {
    const author = new Author({ name: 'Albert Einstein' });

    expect(author.slug).toBeDefined();
  });
});
