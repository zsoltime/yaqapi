'use strict';

const HTTPStatus = require('http-status');
const request = require('supertest');

const app = require('../../server');
const Author = require('../../server/models/Author');
const Category = require('../../server/models/Category');
const Quote = require('../../server/models/Quote');
const Slug = require('../../server/models/Slug');
const { wipeCollections } = require('../helpers');

describe('Quote endpoints', () => {
  const dummyAuthor = {
    name: 'Robert A. Heinlein',
  };
  const dummyCategory = {
    name: 'Fun',
  };
  const dummyQuoteList = [
    "They didn't want it good, they wanted it Wednesday.",
    'Yield to temptation. It may not pass your way again.',
    'Never underestimate the power of human stupidity.',
    'It is a truism that almost any sect, cult, or religion will legislate its creed into law if it acquires the political power to do so.',
    'Never insult anyone by accident.',
    'The universe never did make sense; I suspect it was built on government contract.',
    'Happiness consists in getting enough sleep. Just that, nothing more.',
  ];
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
      const quoteId = '5ad06b68dc42f3b88c548378';

      request(app)
        .get(`/api/quotes/${quoteId}`)
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
});
