'use strict';

const HTTPStatus = require('http-status');
const request = require('supertest');

const app = require('../../server');
const Author = require('../../server/models/Author');
const Category = require('../../server/models/Category');
const Quote = require('../../server/models/Quote');
const Slug = require('../../server/models/Slug');

const { wipeCollections } = require('../helpers');
const dummyAuthor = require('../fixtures/authors')[0];
const dummyCategory = require('../fixtures/categories')[0];
const dummyQuoteList = require('../fixtures/quotes');
const { invalidId, validId } = require('../fixtures/ids');

describe('Quote endpoints', () => {
  let author = null;
  let category = null;
  let quotes = null;

  beforeEach((done) => {
    wipeCollections([Author, Category, Slug, Quote])
      .then(async () => {
        author = await new Author(dummyAuthor).save();
        category = await new Category(dummyCategory).save();
        quotes = dummyQuoteList.slice(1).map(quote => ({
          author: author._id.toString(),
          categories: [category._id.toString()],
          quote,
        }));

        await Quote.create(quotes);
      })
      .then(done)
      .catch(err => done.fail(new Error(err)));
  });

  describe('GET /quotes', () => {
    test('return a list of quotes', (done) => {
      request(app)
        .get('/api/quotes')
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          expect(res.body).toHaveLength(quotes.length);

          res.body.forEach((quote) => {
            expect(dummyQuoteList).toContain(quote.quote);

            expect(quote.author).toEqual(
              expect.objectContaining({
                id: author._id.toString(),
                name: author.name,
                href: expect.stringContaining(
                  `/api/authors/${author._id}`
                ),
              })
            );

            expect(Array.isArray(quote.categories)).toBeTruthy();
            expect(quote.categories).toHaveLength(1);
            expect(quote.categories).toContainEqual(
              expect.objectContaining({
                id: category.id,
                name: category.name,
                href: expect.stringContaining(
                  `/api/categories/${category.id}`
                ),
              })
            );
          });

          done();
        });
    });
  });

  describe('POST /quotes', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('return the created quote after saved to database', (done) => {
      const newQuote = {
        author: author._id.toString(),
        categories: [category._id.toString()],
        quote: dummyQuoteList[0],
      };

      request(app)
        .post('/api/quotes')
        .send(newQuote)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              author: newQuote.author,
              categories: expect.arrayContaining(newQuote.categories),
              href: expect.stringContaining(
                `/api/quotes/${res.body.id}`
              ),
              keywords: expect.arrayContaining([]),
              quote: newQuote.quote,
            })
          );

          done();
        });
    });

    test('return Internal Server Error if Mongoose fails to save', (done) => {
      jest
        .spyOn(Quote, 'create')
        // eslint-disable-next-line prefer-promise-reject-errors
        .mockImplementation(() => Promise.reject({}));

      const newQuote = {
        author: author._id.toString(),
        categories: [category._id.toString()],
        quote: dummyQuoteList[0],
      };

      request(app)
        .post('/api/quotes')
        .send(newQuote)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.INTERNAL_SERVER_ERROR)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    test('return Bad Request if quote field is missing', (done) => {
      request(app)
        .post('/api/quotes')
        .send({
          author: author._id.toString(),
        })
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0].field[0]).toBe('quote');
          done();
        });
    });

    test('return Bad Request if author field is missing', (done) => {
      request(app)
        .post('/api/quotes')
        .send({
          quote: dummyQuoteList[0],
        })
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0].field[0]).toBe('author');
          done();
        });
    });
  });

  describe('GET /quotes/:quoteId', () => {
    test('return the quote if it exists', async (done) => {
      const newQuote = {
        author: author._id.toString(),
        categories: [category._id.toString()],
        quote: dummyQuoteList[0],
      };

      const insertedQuote = await new Quote(newQuote).save();

      request(app)
        .get(`/api/quotes/${insertedQuote._id}`)
        .expect(HTTPStatus.OK)
        .expect('Content-Type', /json/)
        .then((res) => {
          const expectedAuthor = expect.objectContaining({
            _id: author._id.toString(),
            name: author.name,
            href: expect.stringContaining(
              `/api/authors/${author._id}`
            ),
          });
          const expectedCategories = expect.arrayContaining([
            expect.objectContaining({
              _id: category._id.toString(),
              name: category.name,
              href: expect.stringContaining(
                `/api/categories/${category._id}`
              ),
            }),
          ]);

          expect(res.body).toEqual(
            expect.objectContaining({
              author: expectedAuthor,
              categories: expectedCategories,
              href: expect.stringContaining(
                `/api/quotes/${res.body._id}`
              ),
              keywords: [],
              quote: insertedQuote.quote,
            })
          );

          done();
        });
    });

    test('return Not Found if quoteId does not exist', (done) => {
      request(app)
        .get(`/api/quotes/${validId}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0]).toBeTruthy();
          done();
        });
    });

    test('return Bad Request if quoteId is not a correct Mongo ID', (done) => {
      request(app)
        .get(`/api/quotes/${invalidId}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0].field[0]).toBe('quoteId');
          done();
        });
    });
  });

  describe('PUT /quotes/:quoteId', () => {
    test('return the updated document after saved to database', async (done) => {
      const quote = {
        author: author._id.toString(),
        categories: [category._id.toString()],
        quote: dummyQuoteList[0],
      };

      const insertedQuote = await new Quote(quote).save();
      const updatedFields = { quote: 'Updated quote' };

      request(app)
        .put(`/api/quotes/${insertedQuote._id}`)
        .send(updatedFields)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          const expectedAuthor = expect.objectContaining({
            id: author._id.toString(),
            name: author.name,
            href: expect.stringContaining(
              `/api/authors/${author._id}`
            ),
          });
          const expectedCategories = [
            expect.objectContaining({
              id: category._id.toString(),
              name: category.name,
              href: expect.stringContaining(
                `/api/categories/${category._id}`
              ),
            }),
          ];

          expect(res.body).toEqual(
            expect.objectContaining({
              _id: insertedQuote._id.toString(),
              author: expectedAuthor,
              categories: expectedCategories,
              quote: updatedFields.quote,
            })
          );
          done();
        });
    });

    test('return Not Found if quoteId does not exist', (done) => {
      const quoteId = '5ad06b68dc42f3b88c548378';

      request(app)
        .put(`/api/quotes/${quoteId}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0]).toBeTruthy();
          done();
        });
    });

    test('return Bad Request if quoteId is not a correct Mongo ID', (done) => {
      const invalidId = '5ad06b';

      request(app)
        .put(`/api/quotes/${invalidId}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0].field[0]).toBe('quoteId');
          done();
        });
    });

    test('return Bad Request if quote field is invalid', async (done) => {
      const quote = {
        author: author._id.toString(),
        categories: [category._id.toString()],
        quote: dummyQuoteList[0],
      };

      const insertedQuote = await new Quote(quote).save();
      const updatedFields = { quote: '' };

      request(app)
        .put(`/api/quotes/${insertedQuote._id}`)
        .send(updatedFields)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0].field[0]).toBe('quote');
          done();
        });
    });

    test('return Bad Request if categories field is invalid', async (done) => {
      const quote = {
        author: author._id.toString(),
        categories: [category._id.toString()],
        quote: dummyQuoteList[0],
      };

      const insertedQuote = await new Quote(quote).save();
      const invalidId = '5ad06b';
      const updatedFields = { categories: [invalidId] };

      request(app)
        .put(`/api/quotes/${insertedQuote._id}`)
        .send(updatedFields)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0].field[0]).toBe('categories');
          done();
        });
    });
  });

  describe('DELETE /quotes/:quoteId', () => {
    test('return No Content if deleted document successfully', async (done) => {
      const quote = {
        author: author._id.toString(),
        categories: [category._id.toString()],
        quote: dummyQuoteList[0],
      };

      const insertedQuote = await new Quote(quote).save();

      expect(await Quote.findById(insertedQuote._id)).not.toBe(null);

      request(app)
        .delete(`/api/quotes/${insertedQuote._id}`)
        .expect(HTTPStatus.NO_CONTENT)
        .then((res) => {
          expect(res.headers).not.toHaveProperty('Content-Type');
          expect(res.body).toEqual({});

          Quote.findById(insertedQuote._id).then((found) => {
            expect(found).toBe(null);
            return done();
          });
        });
    });

    test('return Not Found if quoteId does not exist', (done) => {
      request(app)
        .delete(`/api/quotes/${validId}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0]).toBeTruthy();
          done();
        });
    });

    test('return Bad Request if quoteId is not a correct Mongo ID', (done) => {
      request(app)
        .delete(`/api/quotes/${invalidId}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0].field[0]).toBe('quoteId');
          done();
        });
    });
  });

  describe('GET /quotes/search/:query', () => {
    test('return a list of matched documents', (done) => {
      const query = 'never';

      const isMatch = (haystack, needle) =>
        haystack.search(new RegExp(needle, 'i')) > -1;

      const matches = dummyQuoteList.reduce(
        (list, quote) =>
          (isMatch(quote, query) ? [...list, quote] : list),
        []
      );

      request(app)
        .get(`/api/quotes/search/${query}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          const expectedAuthor = expect.objectContaining({
            id: author._id.toString(),
            name: author.name,
            href: expect.stringContaining(
              `/api/authors/${author._id}`
            ),
          });
          const expectedCategories = [
            expect.objectContaining({
              id: category._id.toString(),
              name: category.name,
              href: expect.stringContaining(
                `/api/categories/${category._id}`
              ),
            }),
          ];
          const expectedQuote = expect.stringMatching(
            new RegExp(`/${dummyQuoteList.join('|')}/`)
          );

          expect(res.body).toHaveLength(matches.length);
          expect(res.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                author: expectedAuthor,
                categories: expectedCategories,
                quote: expectedQuote,
              }),
            ])
          );

          done();
        });
    });

    test('return Bad Request if query length is less than 3 characters', (done) => {
      const query = 'ne';

      request(app)
        .get(`/api/quotes/search/${query}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.errors).toHaveLength(1);
          expect(res.body.errors[0].field[0]).toBe('query');
          done();
        });
    });
  });
});
