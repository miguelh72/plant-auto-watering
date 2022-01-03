import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';

import * as deviceModel from '../models/devices';
import { getPasshash } from '../utils/authenticate';
import { updatePassword, getSettings, getStates } from './deviceController';
import { ShallowDevice, State, Settings } from '../../shared/types';


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

    mockRequest = { params: {} };
    mockResponse = {
      locals: {},
    };
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
    mockResponse = {
      locals: {},
    };

    await getSettings(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals).not.toHaveProperty('settings');
  });

  test('Get states for a device', async () => {
    mockResponse = {
      locals: { mac },
    };

    await getStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.states).toMatchObject(states);

    // Attempt to get settings for device that doesn't exist should fail
    mockResponse = {
      locals: { mac: '11:1A:C2:7B:1A:47' },
    };

    await getStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals).not.toHaveProperty('states');

    // Attempt to get settings without res.locals.mac should fail
    mockResponse = {
      locals: {},
    };

    await getStates(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals).not.toHaveProperty('states');
  });

  test('Update password', async () => {
    const newPassword: string = 'newPassword';
    mockRequest = { params: { password: newPassword } };
    mockResponse = {
      locals: { mac },
    };

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
    mockRequest = { params: {} };
    mockResponse = {
      locals: { mac },
    };

    await updatePassword(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();

    // Attempt to update password for a device that doest not exist should fail
    mockRequest = { params: { password: newPassword } };
    mockResponse = {
      locals: { mac: '11:1A:C2:7B:1A:47' },
    };

    await updatePassword(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();
  });
});
