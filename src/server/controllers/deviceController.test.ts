import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';

import * as deviceModel from '../models/devices';
import { getPasshash } from '../utils/authenticate';
import { updatePassword, getSettings, getStates, updateSettings, updateClientStates, updateDeviceStates } from './deviceController';
import { ShallowDevice, State, Settings, ClientState, DeviceState } from '../../shared/types';


describe('Test device controller', () => {
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

  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(async () => {
    await deviceModel.clearDatabase();
    await deviceModel.createDevice(mac, await getPasshash(password), settings, states);

    mockRequest = { body: {} };
    mockResponse = { locals: {} };
  });

  afterAll(async () => {
    await deviceModel.clearDatabase();
  });

  test('Get settings for a device', async () => {
    mockResponse = {
      locals: { mac },
    };

    await getSettings(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.settings).toMatchObject(settings);

    // Attempt to get settings for device that doesn't exist should fail
    mockResponse = {
      locals: { mac: '11:1A:C2:7B:1A:47' },
    };

    await getSettings(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals).not.toHaveProperty('settings');

    // Attempt to get settings without res.locals.mac should fail
    mockResponse = { locals: {} };

    await getSettings(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals).not.toHaveProperty('settings');
  });

  test('Get states for a device', async () => {
    mockResponse = { locals: { mac } };

    await getStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.states).toMatchObject(states);

    // Attempt to get settings for device that doesn't exist should fail
    mockResponse = {
      locals: { mac: '11:1A:C2:7B:1A:47' },
    };

    await getStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals).not.toHaveProperty('states');

    // Attempt to get settings without res.locals.mac should fail
    mockResponse = { locals: {} };

    await getStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals).not.toHaveProperty('states');
  });

  test('Update password for a device', async () => {
    const newPassword: string = 'newPassword';
    mockRequest = { body: { password: newPassword } };
    mockResponse = { locals: { mac } };

    await updatePassword(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBe(true);

    const shallowDevice: ShallowDevice = await deviceModel.readShallowDevice(mac) as ShallowDevice;
    expect(await bcrypt.compare(newPassword, shallowDevice.passhash)).toBeTruthy();

    // Attempt to update without setting mac in response should fail
    mockResponse = {
      locals: {},
    };

    await updatePassword(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();

    // Attempt to update without a new password should fail
    mockRequest = { body: {} };
    mockResponse = { locals: { mac } };

    await updatePassword(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();

    // Attempt to update password for a device that doest not exist should fail
    mockRequest = { body: { password: newPassword } };
    mockResponse = { locals: { mac: '11:1A:C2:7B:1A:47' } };

    await updatePassword(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();
  });

  test('Update settings for a device', async () => {
    const newSettings: Settings = { pollFrequency: 500 };
    mockRequest = { body: { settings: newSettings } };
    mockResponse = { locals: { mac } };

    await updateSettings(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBe(true);

    const retrievedSettings: Settings | null = await deviceModel.readSettings(mac);
    expect(retrievedSettings).toMatchObject(newSettings);

    // Attempt to update without setting mac in response should fail
    mockResponse = { locals: {} };

    await updateSettings(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();

    // Attempt to update without a new settings should fail
    mockRequest = { body: {} };
    mockResponse = { locals: { mac } };

    await updateSettings(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();

    // Attempt to update settings for a device that doest not exist should fail
    mockRequest = { body: { settings: newSettings } };
    mockResponse = { locals: { mac: '11:1A:C2:7B:1A:47' } };

    await updateSettings(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();

    // Attempt to update settings with invalid settings object should fail
    mockRequest = { body: { settings: { notValid: true } } };
    mockResponse = { locals: { mac } };

    await updateSettings(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();
  });

  test('Update client states for a device', async () => {
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
    mockRequest = { body: { states: clientState } };
    mockResponse = { locals: { mac } };

    await updateClientStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBe(true);

    const retrievedStates: State[] | null = await deviceModel.readStates(mac);

    expect(retrievedStates).not.toMatchObject(states);
    expect(retrievedStates).toMatchObject(clientState);

    // Attempt to update without setting mac in response should fail
    mockResponse = { locals: {} };

    await updateClientStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();

    // Attempt to update without a new client state should fail
    mockRequest = { body: {} };
    mockResponse = { locals: { mac } };

    await updateClientStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();

    // Attempt to update client state for a device that doest not exist should fail
    mockRequest = { body: { states: clientState } };
    mockResponse = { locals: { mac: '11:1A:C2:7B:1A:47' } };

    await updateClientStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();

    // Attempt to update settings with invalid client state object should fail
    mockRequest = { body: { states: [{ notValid: true }] } };
    mockResponse = { locals: { mac } };

    await updateClientStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();
  });

  test('Update device states for a device', async () => {
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
    mockRequest = { body: { states: deviceState } };
    mockResponse = { locals: { mac } };

    await updateDeviceStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBe(true);

    const retrievedStates: State[] | null = await deviceModel.readStates(mac);

    expect(retrievedStates).not.toMatchObject(states);
    expect(retrievedStates).toMatchObject(deviceState);

    // Attempt to update without setting mac in response should fail
    mockResponse = { locals: {} };

    await updateDeviceStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();

    // Attempt to update without a new client state should fail
    mockRequest = { body: {} };
    mockResponse = { locals: { mac } };

    await updateDeviceStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();

    // Attempt to update client state for a device that doest not exist should fail
    mockRequest = { body: { states: deviceState } };
    mockResponse = { locals: { mac: '11:1A:C2:7B:1A:47' } };

    await updateDeviceStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();

    // Attempt to update settings with invalid client state object should fail
    mockRequest = { body: { states: [{ notValid: true }] } };
    mockResponse = { locals: { mac } };

    await updateDeviceStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();
  });
});
