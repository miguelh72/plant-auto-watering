import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';

import * as deviceModel from '../models/devices';
import { getPasshash } from '../utils/authenticate';
import { updatePassword } from './deviceController';
import { ShallowDevice } from '../../shared/types';


describe('Test device controller', () => {
  const mac = '00:1A:C2:7B:00:47';
  const password = 'test-password';

  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(async () => {
    await deviceModel.clearDatabase();

    mockRequest = { params: {} };
    mockResponse = {
      locals: {},
    };
  });

  afterAll(async () => {
    await deviceModel.clearDatabase();
  });

  test('Update password', async () => {
    const newPassword: string = 'newPassword';

    await deviceModel.createDevice(mac, await getPasshash(password), { pollFrequency: 1000 }, []);
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
  });
});
