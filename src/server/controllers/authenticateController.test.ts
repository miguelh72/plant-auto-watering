import * as deviceModel from './../models/devices';
import { authenticate, verify } from './authenticateController';

describe('Test authentication controller', () => {
  const mac1 = '00:1A:C2:7B:00:47';
  const mac2 = '07:2B:C2:7B:00:47';

  const passhash = '$2b$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa';
  const settings = { pollFrequency: 1000 };

  beforeAll(async () => {
    await deviceModel.createDevice(mac1, passhash, settings, []);
    await deviceModel.createDevice(mac2, passhash, settings, []);
  });

  afterAll(async () => {
    await deviceModel.clearDatabase();
  })

  test('Authenticate client', async () => {
    const token1: string | null = await authenticate(mac1, passhash);
    const token2: string | null = await authenticate(mac2, passhash);

    expect(typeof token1).toBe('string');
    expect(token1).not.toBe(token2);

    expect(await authenticate('Invalid Mac', passhash)).toBeNull();
  });

  test('Verify JWT', async () => {
    const invalidJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZXN0Ijp0cnVlLCJpYXQiOjE2NDExMDM1NDR9.hyHhPeLCqhizoageKysnlhajUCYS7p_td7ksVJFP99c';

    const token: string = await authenticate(mac1, passhash) as string;

    expect(await verify(token)).toBe(mac1);

    // Invalid jwt
    expect(await verify(invalidJWT)).toBeNull();
  });
});
