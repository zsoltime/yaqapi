'use strict';

const HTTPStatus = require('http-status');
const request = require('supertest');

const app = require('../../server');
const Author = require('../../server/models/Author');
const Slug = require('../../server/models/Slug');
const { wipeCollections } = require('../helpers');

describe('Author endpoints', () => {
  const dummyAuthor = {
    name: 'Mark Twain',
    image: '/images/mark-twain-001.jpg',
    nationality: 'American',
    profession: 'writer',
  };

  const dummyAuthorList = [
    { name: 'Mark Twain' },
    { name: 'Albert Einstein' },
    { name: 'Arnold Palmer' },
    { name: 'Arnold Schwarzenegger' },
    { name: 'Paloma Picasso' },
  ];

  beforeAll(() => wipeCollections([Slug, Author]));

  describe('GET /authors', () => {
    beforeEach((done) => {
      wipeCollections([Slug, Author])
        .then(() => Author.create(dummyAuthorList))
        .then(() => done());
    });

    test('return a list of authors', (done) => {
      request(app)
        .get('/api/authors')
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          expect(res.body).toHaveLength(dummyAuthorList.length);

          res.body.forEach((author) => {
            expect(author).toHaveProperty('name');
            expect(author).toHaveProperty('slug');
          });

          done();
        });
    });
  });

  describe('POST /authors', () => {
    beforeEach((done) => {
      wipeCollections([Slug, Author]).then(() => done());
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('return the created author after saved to database', (done) => {
      request(app)
        .post('/api/authors')
        .send(dummyAuthor)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          expect(res.body).toEqual(expect.objectContaining(dummyAuthor));
          expect(res.body.slug).toBeDefined();
          done();
        });
    });

    test('return Internal Server Error if Mongoose fails to save', (done) => {
      jest
        .spyOn(Author, 'create')
        // eslint-disable-next-line prefer-promise-reject-errors
        .mockImplementation(() => Promise.reject({}));

      request(app)
        .post('/api/authors')
        .send(dummyAuthor)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.INTERNAL_SERVER_ERROR)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    test('return Bad Request if required field is missing', (done) => {
      request(app)
        .post('/api/authors')
        .send({})
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    test('create unique slugs for the same names', async (done) => {
      const originalSlug = await Author(dummyAuthor)
        .save()
        .then(res => res.slug);

      request(app)
        .post('/api/authors')
        .send({ name: dummyAuthor.name })
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          expect(originalSlug).toBeDefined();
          expect(res.body.slug).toBeDefined();
          expect(res.body.slug).toMatch(new RegExp(`^${originalSlug}`));
          expect(res.body.slug).not.toBe(originalSlug);
          done();
        });
    });
  });

  describe('GET /authors/:authorId', () => {
    beforeEach((done) => {
      wipeCollections([Slug, Author]).then(() => done());
    });

    test('return the author if it exists', async (done) => {
      const author = await new Author(dummyAuthor).save();

      request(app)
        .get(`/api/authors/${author._id}`)
        .expect(HTTPStatus.OK)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body).toEqual(expect.objectContaining(dummyAuthor));
          done();
        });
    });

    test('return Not Found if authorId does not exist', (done) => {
      const authorId = '5ad06b68dc42f3b88c548378';

      request(app)
        .get(`/api/authors/${authorId}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.NOT_FOUND)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    test('return Bad Request if authorId is not a correct Mongo ID', (done) => {
      const invalidId = '5ad06b';

      request(app)
        .get(`/api/authors/${invalidId}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });

  describe('PUT /authors/:authorId', () => {
    beforeEach((done) => {
      wipeCollections([Slug, Author]).then(() => done());
    });

    test('return the updated document after saved to database', async (done) => {
      const author = await new Author(dummyAuthor).save();
      const updatedFields = { profession: 'author' };

      request(app)
        .put(`/api/authors/${author._id}`)
        .send(updatedFields)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining(
              Object.assign({}, dummyAuthor, updatedFields)
            )
          );
          done();
        });
    });

    test('return Not Found if authorId does not exist', (done) => {
      const authorId = '5ad06b68dc42f3b88c548378';

      request(app)
        .put(`/api/authors/${authorId}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.NOT_FOUND)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    test('return Bad Request if authorId is not a correct Mongo ID', (done) => {
      const invalidId = '5ad06b';

      request(app)
        .put(`/api/authors/${invalidId}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    test('return Bad Request if name field is invalid', async (done) => {
      const author = await new Author(dummyAuthor).save();
      const updatedFields = { name: '' };

      request(app)
        .put(`/api/authors/${author._id}`)
        .send(updatedFields)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .then((res) => {
          if (res.error.text) {
            try {
              const response = JSON.parse(res.error.text);
              expect(response.errors[0].field[0]).toBe('name');
              done();
            } catch (e) {
              done.fail(new Error(e));
            }
          } else {
            done.fail(new Error());
          }
        });
    });

    test('return Bad Request if slug field is invalid', async (done) => {
      const author = await new Author(dummyAuthor).save();
      const updatedFields = { slug: '' };

      request(app)
        .put(`/api/authors/${author._id}`)
        .send(updatedFields)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .then((res) => {
          if (res.error.text) {
            try {
              const response = JSON.parse(res.error.text);
              expect(response.errors[0].field[0]).toBe('slug');
              done();
            } catch (e) {
              done.fail(new Error(e));
            }
          } else {
            done.fail(new Error());
          }
        });
    });

    test('create unique slugs', async (done) => {
      const author1 = await new Author(dummyAuthor).save();
      const author2 = await new Author(dummyAuthor).save();

      request(app)
        .put(`/api/authors/${author2._id}`)
        .send({ slug: author1.slug })
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          expect(res.body.slug).toBeDefined();
          expect(res.body.slug).toMatch(new RegExp(`^${author1.slug}`));
          expect(res.body.slug).not.toBe(author1.slug);
          done();
        });
    });
  });

  describe('DELETE /authors/:authorId', () => {
    beforeEach((done) => {
      wipeCollections([Slug, Author]).then(() => done());
    });

    test('return No Content if deleted document successfully', async (done) => {
      const author = await new Author(dummyAuthor).save();

      request(app)
        .delete(`/api/authors/${author._id}`)
        .expect(HTTPStatus.NO_CONTENT)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.headers).not.toHaveProperty('Content-Type');
          expect(res.body).toEqual({});

          Author.findById(author._id).then((found) => {
            expect(found).toBeFalsy();
            return done();
          });
        });
    });

    test('return Not Found if authorId does not exist', (done) => {
      const authorId = '5ad06b68dc42f3b88c548378';

      request(app)
        .delete(`/api/authors/${authorId}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.NOT_FOUND)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    test('return Bad Request if authorId is not a correct Mongo ID', (done) => {
      const invalidId = '5ad06b';

      request(app)
        .delete(`/api/authors/${invalidId}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });

  describe('GET /authors/search/:query', () => {
    beforeEach((done) => {
      wipeCollections([Slug, Author])
        .then(() => Author.create(dummyAuthorList))
        .then(() => done());
    });

    test('return a list of matched documents', (done) => {
      const query = 'pal';

      const matches = dummyAuthorList.reduce(
        (names, { name }) =>
          (name.search(new RegExp(query, 'i')) > -1
            ? [...names, name]
            : names),
        []
      );

      request(app)
        .get(`/api/authors/search/${query}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          expect(res.body.length).toBe(2);
          expect(matches.includes(res.body[0].name)).toBeTruthy();
          expect(matches.includes(res.body[1].name)).toBeTruthy();
          done();
        });
    });

    test('return Bad Request if query length is less than 3 characters', (done) => {
      const query = 'pa';

      request(app)
        .get(`/api/authors/search/${query}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });
});
