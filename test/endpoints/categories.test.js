'use strict';

const HTTPStatus = require('http-status');
const request = require('supertest');

const app = require('../../server');
const Category = require('../../server/models/Category');
const { wipeCollections } = require('../helpers');

describe('Category endpoints', () => {
  const dummyCategory = { name: 'Motivational' };
  const dummyCategoryList = [
    { name: 'Art' },
    { name: 'Chance' },
    { name: 'Change' },
    { name: 'Fun' },
    { name: 'Love' },
    { name: 'Science' },
  ];

  beforeAll((done) => {
    wipeCollections([Category])
      .then(() => done())
      .catch(err => done(err));
  });

  describe('GET /categories', () => {
    beforeEach((done) => {
      wipeCollections([Category])
        .then(() => Category.create(dummyCategoryList))
        .then(() => done())
        .catch(err => done(err));
    });

    test('return a list of categories', (done) => {
      request(app)
        .get('/api/categories')
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          expect(res.body).toHaveLength(dummyCategoryList.length);

          res.body.forEach((category) => {
            expect(category).toHaveProperty('name');
            expect(category).toHaveProperty('slug');
          });

          done();
        });
    });
  });

  describe('POST /categories', () => {
    beforeEach((done) => {
      wipeCollections([Category])
        .then(() => done())
        .catch(err => done(err));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('return the created category after saved to database', (done) => {
      request(app)
        .post('/api/categories')
        .send(dummyCategory)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining(dummyCategory)
          );
          expect(res.body.slug).toBe(
            dummyCategory.name.toLowerCase()
          );
          done();
        });
    });

    test('return Internal Server Error if Mongoose fails to save', (done) => {
      jest
        .spyOn(Category, 'create')
        // eslint-disable-next-line prefer-promise-reject-errors
        .mockImplementation(() => Promise.reject({}));

      request(app)
        .post('/api/categories')
        .send(dummyCategory)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.INTERNAL_SERVER_ERROR)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    test('return Bad Request if required field is missing', (done) => {
      request(app)
        .post('/api/categories')
        .send({})
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    // FIXME: return error on duplicates
    test.skip('return ??? if name already exists', () => {});
  });

  describe('GET /categories/:categoryId', () => {
    beforeEach((done) => {
      wipeCollections([Category])
        .then(() => done())
        .catch(err => done(err));
    });

    test('return the category if it exists', async (done) => {
      const category = await new Category(dummyCategory).save();

      request(app)
        .get(`/api/categories/${category._id}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining(dummyCategory)
          );
          done();
        });
    });

    test('return Not Found if categoryId does not exist', (done) => {
      const categoryId = '5ad06b68dc42f3b88c548378';

      request(app)
        .get(`/api/categories/${categoryId}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.NOT_FOUND)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    test('return Bad Request if categoryId is not a correct Mongo ID', (done) => {
      const invalidId = '5ad06b';

      request(app)
        .get(`/api/categories/${invalidId}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });

  describe('PUT /categories/:categoryId', () => {
    beforeEach((done) => {
      wipeCollections([Category])
        .then(() => done())
        .catch(err => done(err));
    });

    test('return the updated document after saved to database', async (done) => {
      const category = await new Category(dummyCategory).save();
      const updatedFields = {
        name: 'New Category',
        slug: 'new-category',
      };

      request(app)
        .put(`/api/categories/${category._id}`)
        .send(updatedFields)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.OK)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining(
              Object.assign({}, dummyCategory, updatedFields)
            )
          );
          done();
        });
    });

    test('return Not Found if categoryId does not exist', (done) => {
      const categoryId = '5ad06b68dc42f3b88c548378';

      request(app)
        .put(`/api/categories/${categoryId}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.NOT_FOUND)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    test('return Bad Request if categoryId is not a correct Mongo ID', (done) => {
      const invalidId = '5ad06b';

      request(app)
        .put(`/api/categories/${invalidId}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    test('return Bad Request if name field is invalid', async (done) => {
      const category = await new Category(dummyCategory).save();
      const updatedFields = { name: '' };

      request(app)
        .put(`/api/categories/${category._id}`)
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
      const category = await new Category(dummyCategory).save();
      const updatedFields = { slug: '' };

      request(app)
        .put(`/api/categories/${category._id}`)
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

    // FIXME: return error on duplicates
    test.skip('return ??? if slug/name already exists');
  });

  describe('DELETE /categories/:categoryId', () => {
    beforeEach((done) => {
      wipeCollections([Category])
        .then(() => done())
        .catch(err => done(err));
    });

    test('return No Content if deleted document successfully', async (done) => {
      const category = await new Category(dummyCategory).save();

      request(app)
        .delete(`/api/categories/${category._id}`)
        .expect(HTTPStatus.NO_CONTENT)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.headers).not.toHaveProperty('Content-Type');
          expect(res.body).toEqual({});

          Category.findById(category._id).then((found) => {
            expect(found).toBeFalsy();
            return done();
          });
        });
    });

    test('return Not Found if categoryId does not exist', (done) => {
      const categoryId = '5ad06b68dc42f3b88c548378';

      request(app)
        .delete(`/api/categories/${categoryId}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.NOT_FOUND)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    test('return Bad Request if categoryId is not a correct Mongo ID', (done) => {
      const invalidId = '5ad06b';

      request(app)
        .delete(`/api/categories/${invalidId}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });

  describe('GET /categories/search/:query', () => {
    beforeEach((done) => {
      wipeCollections([Category])
        .then(() => Category.create(dummyCategoryList))
        .then(() => done())
        .catch(err => done(err));
    });

    test('return a list of matched documents', (done) => {
      const query = 'chan';

      const matches = dummyCategoryList.reduce(
        (names, { name }) =>
          (name.search(new RegExp(query, 'i')) > -1
            ? [...names, name]
            : names),
        []
      );

      request(app)
        .get(`/api/categories/search/${query}`)
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
      const query = 'ch';

      request(app)
        .get(`/api/categories/search/${query}`)
        .expect('Content-Type', /json/)
        .expect(HTTPStatus.BAD_REQUEST)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });
});
