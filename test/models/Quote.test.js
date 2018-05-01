'use strict';

const Quote = require('../../server/models/Quote');

describe('Quote model', () => {
  test('return an error if author is empty', (done) => {
    const quote = new Quote({ quote: 'test' });

    quote.validate().catch(({ errors }) => {
      expect(Object.keys(errors)).toHaveLength(1);
      expect(errors).toHaveProperty('author');
      done();
    });
  });

  test('return an error if quote is empty', (done) => {
    const quote = new Quote({
      author: '5ad06b68dc42f3b88c548378',
    });

    quote.validate().catch(({ errors }) => {
      expect(Object.keys(errors)).toHaveLength(1);
      expect(errors).toHaveProperty('quote');
      done();
    });
  });

  test('return an error if author is not a valid mongo ID', (done) => {
    const quote = new Quote({
      author: 'invalidID',
      quote: 'test',
    });

    quote.validate().catch(({ errors }) => {
      expect(Object.keys(errors)).toHaveLength(1);
      expect(errors).toHaveProperty('author');
      done();
    });
  });
});
