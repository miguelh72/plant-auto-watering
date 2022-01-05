import { Request, Response, NextFunction } from 'express';

import * as deviceModel from './../models/devices';
import { createJWT, validateJWT } from './loginController';
import { getPasshash, verifyToken, getJWT } from './../utils/authenticate';


describe('Test login controller', () => {
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

  test('Login to device', async () => {
    mockRequest = { body: { mac, password } };

    await deviceModel.createDevice(mac, await getPasshash(password), { pollFrequency: 1000 }, []);

    await createJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).toHaveProperty('jwt');
    expect(typeof mockResponse.locals?.jwt).toBe('string');
    expect(await verifyToken(mockResponse.locals?.jwt)).toBe(mac);
    expect(nextFunction).toHaveBeenCalledTimes(1);

    // invalid mac
    mockResponse = {
      locals: {},
    };
    mockRequest = { body: { mac: 'Not:valid', password } };
    nextFunction = jest.fn();
    await createJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).not.toHaveProperty('jwt');
    expect(nextFunction).toHaveBeenCalledTimes(1);

    // invalid password
    mockRequest = { body: { mac, password: 'wrongPass' } };
    nextFunction = jest.fn();
    await createJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).not.toHaveProperty('jwt');
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  test('Validate token', async () => {
    let token: string = await getJWT(mac) as string;
    mockRequest = { headers: { token } };

    await validateJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).toHaveProperty('mac');
    expect(mockResponse.locals?.mac).toBe(mac);
    expect(nextFunction).toHaveBeenCalledTimes(1);

    // different token
    token = await getJWT('11:1A:C2:7B:27:1A') as string;
    mockRequest = { headers: { token } };
    mockResponse = {
      locals: {},
    };
    nextFunction = jest.fn();

    await validateJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals?.mac).not.toBe(mac);
    expect(nextFunction).toHaveBeenCalledTimes(1);

    // invalid token
    mockRequest = { headers: { token: 'NotAValidToken' } };
    mockResponse = {
      locals: {},
    };
    nextFunction = jest.fn();

    await validateJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).not.toHaveProperty('mac');
    expect(nextFunction).toHaveBeenCalledTimes(1);

    // unset token
    mockRequest = { headers: {} };
    mockResponse = {
      locals: {},
    };
    nextFunction = jest.fn();

    await validateJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).not.toHaveProperty('mac');
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });
});
