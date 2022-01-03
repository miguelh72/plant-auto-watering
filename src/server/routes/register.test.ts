import supertest from 'supertest';

import app from './../index';
import * as deviceModel from './../models/devices';
import { verifyToken, getPasshash, getJWT } from './../utils/authenticate';

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
      .then(async result => {
        expect(await verifyToken(result.body.token)).toBe(mac)
        expect(await deviceModel.readShallowDevice(mac)).toBeTruthy();
      });
  });

  test('Register a new device with invalid MAC', async () => {
    return supertest(app)
      .post('/register')
      .send({ mac: "Not:Valid", password })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(400)
      .then(async result => {
        expect(result.body).toHaveProperty('error');
        expect(await deviceModel.readShallowDevice(mac)).toBeNull();
      });
  });

  test('Remove a device', async () => {
    await deviceModel.createDevice(mac, await getPasshash(password), { pollFrequency: 1000 }, []);
    const token = await getJWT(mac);

    return supertest(app)
      .delete('/register')
      .send({ token })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(async result => {
        expect(result.body).toHaveProperty('message');
        expect(await deviceModel.readShallowDevice(mac)).toBeNull();
      });
  });

  test('Attempt to remove device with invalid token', async () => {
    await deviceModel.createDevice(mac, await getPasshash(password), { pollFrequency: 1000 }, []);
    const invalidToken = 'This is not a valid token';

    return supertest(app)
      .delete('/register')
      .send({ token: invalidToken })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(401)
      .then(async result => {
        expect(result.body).toHaveProperty('error');
        expect(await deviceModel.readShallowDevice(mac)).toBeTruthy();
      });
  });

  test('Attempt to remove device that doesn\'t exist', async () => {
    await deviceModel.createDevice(mac, await getPasshash(password), { pollFrequency: 1000 }, []);
    const invalidToken = await getJWT('11:1A:C2:7B:22:33');

    return supertest(app)
      .delete('/register')
      .send({ token: invalidToken })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(500)
      .then(async result => {
        expect(result.body).toHaveProperty('error');
        expect(await deviceModel.readShallowDevice(mac)).toBeTruthy();
      });
  });
});
