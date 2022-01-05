import supertest from 'supertest';
import bcrypt from 'bcrypt';

import app from '../index';
import * as deviceModel from '../models/devices';
import { getPasshash, getJWT } from '../utils/authenticate';
import { Settings, State, ShallowDevice, ClientState, DeviceState } from './../../shared/types';

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
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', token)
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
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', invalidToken)
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .then(async result => {
          expect(result.body).toHaveProperty('error');
        });
    });

    test('Fetch settings for a device that doesn\'t exist', async () => {
      const invalidToken: string = await getJWT('11:1A:C2:7B:22:47') as string;

      return supertest(app)
        .get('/api/device/settings')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', invalidToken)
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
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', token)
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
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', invalidToken)
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .then(async result => {
          expect(result.body).toHaveProperty('error');
        });
    });

    test('Fetch states for a device that doesn\'t exist', async () => {
      const invalidToken: string = await getJWT('11:1A:C2:7B:22:47') as string;

      return supertest(app)
        .get('/api/device/states')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', invalidToken)
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
        .send({ password: newPassword })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', token)
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
        .send({ password: newPassword })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', invalidToken)
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .then(async result => {
          expect(result.body).toHaveProperty('error');

          const shallowDevice: ShallowDevice = await deviceModel.readShallowDevice(mac) as ShallowDevice;
          expect(await bcrypt.compare(newPassword, shallowDevice.passhash)).toBeFalsy();
        });
    });

    test('Attempt to update device password for device that doesn\'t exist', async () => {
      const invalidToken: string = await getJWT('11:1A:C2:7B:22:47') as string;

      return supertest(app)
        .patch('/api/device/password')
        .send({ password: newPassword })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', invalidToken)
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .then(async result => {
          expect(result.body).toHaveProperty('error');

          const shallowDevice: ShallowDevice = await deviceModel.readShallowDevice(mac) as ShallowDevice;
          expect(await bcrypt.compare(newPassword, shallowDevice.passhash)).toBeFalsy();
        });
    });
  });

  describe('Patch settings', () => {
    const newSettings: Settings = { pollFrequency: 499 };

    test('Update device settings', async () => {
      return supertest(app)
        .patch('/api/device/settings')
        .send({ settings: newSettings })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', token)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(async result => {
          expect(result.body).toHaveProperty('message');

          const deviceSettings: Settings = await deviceModel.readSettings(mac) as Settings;
          expect(deviceSettings).toEqual(newSettings);
        });
    });

    test('Attempt to update device settings with invalid token', async () => {
      const invalidToken = 'invalidToken';

      return supertest(app)
        .patch('/api/device/settings')
        .send({ settings: newSettings })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', invalidToken)
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .then(async result => {
          expect(result.body).toHaveProperty('error');

          const deviceSettings: Settings = await deviceModel.readSettings(mac) as Settings;
          expect(deviceSettings).toEqual(settings);
        });
    });

    test('Attempt to update device settings for device that doesn\'t exist', async () => {
      const invalidToken: string = await getJWT('11:1A:C2:7B:22:47') as string;

      return supertest(app)
        .patch('/api/device/settings')
        .send({ settings: newSettings })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', invalidToken)
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .then(async result => {
          expect(result.body).toHaveProperty('error');

          const deviceSettings: Settings = await deviceModel.readSettings(mac) as Settings;
          expect(deviceSettings).toEqual(settings);
        });
    });
  });

  describe('Patch client states', () => {
    const newClientStates: ClientState[] = [
      {
        sensor: {
          pin: 7,
          threshold: 99,
        },
        pump: {
          pin: 5,
          speed: 145,
        }
      }
    ];

    test('Update device client states', async () => {
      return supertest(app)
        .patch('/api/device/states/client')
        .send({ states: newClientStates })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', token)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(async result => {
          expect(result.body).toHaveProperty('message');

          const states: State[] = await deviceModel.readStates(mac) as State[];
          expect(states).toMatchObject(newClientStates);
        });
    });

    test('Attempt to update client states with invalid token', async () => {
      const invalidToken = 'invalidToken';

      return supertest(app)
        .patch('/api/device/states/client')
        .send({ states: newClientStates })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', invalidToken)
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .then(async result => {
          expect(result.body).toHaveProperty('error');

          const deviceSettings: Settings = await deviceModel.readSettings(mac) as Settings;
          expect(deviceSettings).toEqual(settings);
        });
    });

    test('Attempt to update client states for device that doesn\'t exist', async () => {
      const invalidToken: string = await getJWT('11:1A:C2:7B:22:47') as string;

      return supertest(app)
        .patch('/api/device/states/client')
        .send({ states: newClientStates })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', invalidToken)
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .then(async result => {
          expect(result.body).toHaveProperty('error');

          const deviceSettings: Settings = await deviceModel.readSettings(mac) as Settings;
          expect(deviceSettings).toEqual(settings);
        });
    });
  });

  describe('Patch device states', () => {
    const newDeviceStates: DeviceState[] = [
      {
        sensor: {
          pin: 7,
          level: 33,
        },
        pump: {
          pin: 5,
          isActive: true,
          thresholdOffset: 59,
        }
      }
    ];

    test('Update device device states', async () => {
      return supertest(app)
        .patch('/api/device/states/device')
        .send({ states: newDeviceStates })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', token)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(async result => {
          expect(result.body).toHaveProperty('message');

          const states: State[] = await deviceModel.readStates(mac) as State[];
          expect(states).toMatchObject(newDeviceStates);
        });
    });

    test('Attempt to update device states with invalid token', async () => {
      const invalidToken = 'invalidToken';

      return supertest(app)
        .patch('/api/device/states/device')
        .send({ states: newDeviceStates })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', invalidToken)
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .then(async result => {
          expect(result.body).toHaveProperty('error');

          const deviceSettings: Settings = await deviceModel.readSettings(mac) as Settings;
          expect(deviceSettings).toEqual(settings);
        });
    });

    test('Attempt to update device states for device that doesn\'t exist', async () => {
      const invalidToken: string = await getJWT('11:1A:C2:7B:22:47') as string;

      return supertest(app)
        .patch('/api/device/states/device')
        .send({ states: newDeviceStates })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Token', invalidToken)
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .then(async result => {
          expect(result.body).toHaveProperty('error');

          const deviceSettings: Settings = await deviceModel.readSettings(mac) as Settings;
          expect(deviceSettings).toEqual(settings);
        });
    });
  });
});
