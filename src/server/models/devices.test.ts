import * as deviceModel from './devices';
import { Settings, State, ShallowDevice, ClientState, DeviceState } from './../../shared/types';

describe('CRUD operations on device model', () => {
  const mac1 = '00:1A:C2:7B:00:47';
  const mac2 = '07:2B:C2:7B:00:47';

  const passhash1 = '$2b$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa';
  const passhash2 = '$2b$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSABCD';

  const settings1: Settings = { pollFrequency: 1000 };
  const settings2: Settings = { pollFrequency: 2000 };

  const state1: State[] = [
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

  beforeEach(async () => {
    await deviceModel.clearDatabase();
  });

  afterAll(async () => {
    await deviceModel.clearDatabase();
  });

  test('Create new device', async () => {
    expect(await deviceModel.createDevice(mac1, passhash1, settings1, state1)).toBe(true);

    // creating device that already exists returns false
    expect(await deviceModel.createDevice(mac1, passhash1, settings1, state1)).toBe(false);

    expect(await deviceModel.createDevice(mac2, passhash2, settings1, state1)).toBe(true);
  });

  test('Read device', async () => {
    await deviceModel.createDevice(mac1, passhash1, settings1, state1);
    await deviceModel.createDevice(mac2, passhash2, settings2, []);

    const shallowDevice: ShallowDevice | null = await deviceModel.readShallowDevice(mac1);

    expect(shallowDevice).not.toBeNull();
    expect(shallowDevice).toMatchObject({ mac: mac1, passhash: passhash1 });

    let settings: Settings | null = await deviceModel.readSettings(mac1);

    expect(settings).toMatchObject(settings1);

    let states: State[] | null = await deviceModel.readStates(mac1);

    expect(states).toHaveLength(state1.length);
    expect(states).toMatchObject(state1);

    states = await deviceModel.readStates(mac2);

    expect(states).toHaveLength(0);
    expect(states).toMatchObject([]);
  });

  test('Update device', async () => {
    await deviceModel.createDevice(mac1, passhash1, settings1, state1);

    // passhash
    expect(await deviceModel.updatePasshash(mac2, passhash2)).toBe(false);
    expect(await deviceModel.updatePasshash(mac1, passhash2)).toBe(true);
    expect(await deviceModel.readShallowDevice(mac1)).toMatchObject({ mac: mac1, passhash: passhash2 });

    // settings
    expect(await deviceModel.updateSettings(mac2, settings2)).toBe(false);
    expect(await deviceModel.updateSettings(mac1, settings2)).toBe(true);
    expect(await deviceModel.readSettings(mac1)).toMatchObject(settings2);

    // client state
    const clientState: ClientState[] = [
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
    expect(await deviceModel.updateClientStates(mac2, clientState)).toBe(false);
    expect(await deviceModel.updateClientStates(mac1, clientState)).toBe(true);
    expect(await deviceModel.readStates(mac1)).toMatchObject(clientState);

    // device state
    const deviceState: DeviceState[] = [
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
    expect(await deviceModel.updateDeviceStates(mac2, deviceState)).toBe(false);
    expect(await deviceModel.updateDeviceStates(mac1, deviceState)).toBe(true);
    expect(await deviceModel.readStates(mac1)).toMatchObject(deviceState);
  });

  test('Delete device', async () => {
    await deviceModel.createDevice(mac1, passhash1, settings1, state1);
    await deviceModel.createDevice(mac2, passhash2, settings1, []);

    expect(await deviceModel.removeDevice(mac1)).toBe(true);

    // deleting a device that does not exist should return false
    expect(await deviceModel.removeDevice(mac1)).toBe(false);

    // other devices should not be affected
    expect(await deviceModel.readShallowDevice(mac2)).toMatchObject({ mac: mac2, passhash: passhash2 })
  });
});
