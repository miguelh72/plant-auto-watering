import supertest from 'supertest';

import app from './../index';
import * as deviceModel from './../models/devices';

describe('API testing registration endpoints', () => {
  const mac = '00:1A:C2:7B:00:47';
  const password = 'test-password';

  beforeEach(async () => {
    await deviceModel.clearDatabase();
  });

  afterAll(async () => {
    await deviceModel.clearDatabase();
  });

  test('Register a new device', async () => {
    return supertest(app)
      .post('/register')
      .send({ mac, password })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(result => {
        console.log({ result }); // ! remove 
        //expect(result.body).toEqual(expect.arrayContaining(getAllCountryNames()));
        expect(true).toBe(true)
      });
  });
});