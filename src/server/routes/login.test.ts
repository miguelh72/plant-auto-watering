import supertest from 'supertest';

import app from '../index';
import * as deviceModel from '../models/devices';
import { verifyToken, getPasshash, getJWT } from '../utils/authenticate';

describe('API testing login endpoint', () => {
  const mac = '00:1A:C2:7B:00:47';
  const password = 'test-password';

  beforeEach(async () => {
    await deviceModel.clearDatabase();
    await deviceModel.createDevice(mac, await getPasshash(password), { pollFrequency: 1000 }, []);
  });

  afterAll(async () => {
    await deviceModel.clearDatabase();
  });

  test('Authenticate a client', async () => {
    return supertest(app)
      .post('/login')
      .send({ mac, password })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(async result => {
        expect(await verifyToken(result.body.token)).toBe(mac)
      });
  });

  test('Attempt to authenticate a client with invalid MAC', async () => {
    return supertest(app)
      .post('/login')
      .send({ mac: "Not:Valid", password })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(400)
      .then(async result => {
        expect(result.body).toHaveProperty('error');
      });
  });

  test('Attempt to authenticate to a device that doesn\'t exist', async () => {
    return supertest(app)
      .post('/login')
      .send({ mac: '11:1A:C2:7B:22:33', password })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(400)
      .then(async result => {
        expect(result.body).toHaveProperty('error');
      });
  });
});
