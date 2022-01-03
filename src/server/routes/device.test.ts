import supertest from 'supertest';
import bcrypt from 'bcrypt';

import app from '../index';
import * as deviceModel from '../models/devices';
import { getPasshash, getJWT } from '../utils/authenticate';
import { Settings, State, ShallowDevice } from './../../shared/types';

describe('API testing device endpoints', () => {
  const mac = '00:1A:C2:7B:00:47';
  const password = 'test-password';
  const settings: Settings = { pollFrequency: 1000 };
  const states: State[] = [
    {
      sensor: {
        pin: 7,
        threshold: 100,
        level: 50,
      },
      pump: {
        pin: 5,
        isActive: false,
        speed: 255,
        thresholdOffset: 50,
      }
    }
  ];
  let token: string;

  beforeEach(async () => {
    await deviceModel.clearDatabase();
    await deviceModel.createDevice(mac, await getPasshash(password), settings, states);
    token = await getJWT(mac) as string;
  });

  afterAll(async () => {
    await deviceModel.clearDatabase();
  });

  describe('Fetch settings', () => {
    test('Fetch settings for a device', async () => {
      return supertest(app)
        .get('/api/device/settings')
        .send({ token })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(async result => {
          expect(result.body.settings).toMatchObject(settings);
        });
    });

    test('Fetch settings with invalid token', async () => {
      const invalidToken = 'invalidToken';

      return supertest(app)
        .get('/api/device/settings')
        .send({ token: invalidToken })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .then(async result => {
          expect(result.body).toHaveProperty('error');
        });
    });

    test('Fetch settings for a device that doesn\'t exist', async () => {
      const invalidToken = await getJWT('11:1A:C2:7B:22:47');

      return supertest(app)
        .get('/api/device/settings')
        .send({ token: invalidToken })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .then(async result => {
          expect(result.body).toHaveProperty('error');
        });
    });
  });

  describe('Fetch states', () => {
    test('Fetch states for a device', async () => {
      return supertest(app)
        .get('/api/device/states')
        .send({ token })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(async result => {
          expect(result.body.states).toMatchObject(states);
        });
    });

    test('Fetch states with invalid token', async () => {
      const invalidToken = 'invalidToken';

      return supertest(app)
        .get('/api/device/states')
        .send({ token: invalidToken })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .then(async result => {
          expect(result.body).toHaveProperty('error');
        });
    });

    test('Fetch states for a device that doesn\'t exist', async () => {
      const invalidToken = await getJWT('11:1A:C2:7B:22:47');

      return supertest(app)
        .get('/api/device/states')
        .send({ token: invalidToken })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .then(async result => {
          expect(result.body).toHaveProperty('error');
        });
    });
  });

  describe('Patch password', () => {
    const newPassword = 'newPassword';

    test('Update device password', async () => {
      return supertest(app)
        .patch('/api/device/password')
        .send({ token, password: newPassword })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(async result => {
          expect(result.body).toHaveProperty('message');

          const shallowDevice: ShallowDevice = await deviceModel.readShallowDevice(mac) as ShallowDevice;
          expect(await bcrypt.compare(newPassword, shallowDevice.passhash)).toBeTruthy();
        });
    });

    test('Attempt to update device password with invalid token', async () => {
      const invalidToken = 'invalidToken';

      return supertest(app)
        .patch('/api/device/password')
        .send({ token: invalidToken, password: newPassword })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .then(async result => {
          expect(result.body).toHaveProperty('error');

          const shallowDevice: ShallowDevice = await deviceModel.readShallowDevice(mac) as ShallowDevice;
          expect(await bcrypt.compare(newPassword, shallowDevice.passhash)).toBeFalsy();
        });
    });

    test('Attempt to update device password for device that doesn\'t exist', async () => {
      const invalidToken = await getJWT('11:1A:C2:7B:22:47');

      return supertest(app)
        .patch('/api/device/password')
        .send({ token: invalidToken, password: newPassword })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .then(async result => {
          expect(result.body).toHaveProperty('error');

          const shallowDevice: ShallowDevice = await deviceModel.readShallowDevice(mac) as ShallowDevice;
          expect(await bcrypt.compare(newPassword, shallowDevice.passhash)).toBeFalsy();
        });
    });
  });
});
