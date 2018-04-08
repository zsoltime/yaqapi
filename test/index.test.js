const request = require('supertest');
const { app, server } = require('../server');

afterAll(() => {
  server.close();
});

test('server runs', (done) => {
  request(app)
    .get('/')
    .expect('Content-Type', /json/)
    .expect(200, done);
});
