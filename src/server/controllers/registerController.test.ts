import { Request, Response, NextFunction } from 'express';

import * as deviceModel from './../models/devices';
import { createDevice, removeDevice } from './registerController';
import { verify, getPasshash, getJWT } from './../utils/authenticate';


describe('Test register controller', () => {
  const mac = '00:1A:C2:7B:00:47';
  const password = 'test-password';

  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(async () => {
    await deviceModel.clearDatabase();

    mockRequest = { body: {} };
    mockResponse = {
      locals: {},
    };
  });

  afterAll(async () => {
    await deviceModel.clearDatabase();
  });

  test('Create new device', async () => {
    mockRequest = { body: { mac, password } };
    await createDevice(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).toHaveProperty('jwt');
    expect(await verify(mockResponse.locals?.jwt)).toBe(mac);

    // try to create a duplicate device
    mockResponse = {
      locals: {},
    };
    await createDevice(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).not.toHaveProperty('jwt');

    // try to create an entry with invalid mac
    mockRequest = { body: { mac: 'Not:Mac', password } };
    await createDevice(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).not.toHaveProperty('jwt');
  });

  test('Remove a device', async () => {
    await deviceModel.createDevice(mac, await getPasshash(password), { pollFrequency: 1000 }, []);
    mockResponse = {
      locals: { mac },
    };

    await removeDevice(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals?.successful).toBe(true);
    expect(await deviceModel.readShallowDevice(mac)).toBeNull();

    // attempt to remove device that does not exist should fail
    mockResponse = {
      locals: { mac },
    };
    await removeDevice(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals?.successful).toBeFalsy();

    // attempt to remove device without setting res.locals.mac should fail
    mockResponse = {
      locals: {},
    };
    await removeDevice(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals?.successful).toBeFalsy();
  });
});
