import { Request, Response, NextFunction } from 'express';

import * as deviceModel from './../models/devices';
import { createDevice, removeDevice } from './registerController';
import { verifyToken, getPasshash, getJWT } from './../utils/authenticate';


describe('Test register controller', () => {
  const mac = '00:1A:C2:7B:00:47';
  const password = 'test-password';

  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(async () => {
    await deviceModel.clearDatabase();

    mockRequest = { body: {} };
    mockResponse = {
      locals: {},
    };
    nextFunction = jest.fn();
  });

  afterAll(async () => {
    await deviceModel.clearDatabase();
  });

  test('Create new device', async () => {
    mockRequest = { body: { mac, password } };
    await createDevice(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).toHaveProperty('jwt');
    expect(await verifyToken(mockResponse.locals?.jwt)).toBe(mac);
    expect(nextFunction).toHaveBeenCalledTimes(1);

    // try to create a duplicate device
    mockResponse = {
      locals: {},
    };
    nextFunction = jest.fn();

    await createDevice(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals).not.toHaveProperty('jwt');
    expect(nextFunction).toHaveBeenCalledTimes(1);

    // try to create an entry with invalid mac
    mockRequest = { body: { mac: 'Not:Mac', password } };
    nextFunction = jest.fn();

    await createDevice(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals).not.toHaveProperty('jwt');
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  test('Remove a device', async () => {
    await deviceModel.createDevice(mac, await getPasshash(password), { pollFrequency: 1000 }, []);
    mockResponse = {
      locals: { mac },
    };

    await removeDevice(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals?.successful).toBe(true);
    expect(await deviceModel.readShallowDevice(mac)).toBeNull();
    expect(nextFunction).toHaveBeenCalledTimes(1);

    // attempt to remove device that does not exist should fail
    mockResponse = {
      locals: { mac },
    };
    nextFunction = jest.fn();

    await removeDevice(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();
    expect(nextFunction).toHaveBeenCalledTimes(1);

    // attempt to remove device without setting res.locals.mac should fail
    mockResponse = {
      locals: {},
    };
    nextFunction = jest.fn();

    await removeDevice(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.successful).toBeFalsy();
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });
});
