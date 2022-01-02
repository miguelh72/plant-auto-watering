import { Request, Response, NextFunction } from 'express';

import * as deviceModel from './../models/devices';
import { createJWT, validateJWT } from './loginController';
import { getPasshash, verify, getJWT } from './../utils/authenticate';


describe('Test login controller', () => {
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

  test('Login to device', async () => {
    mockRequest = { params: { mac, password } };

    await deviceModel.createDevice(mac, await getPasshash(password), { pollFrequency: 1000 }, []);

    await createJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).toHaveProperty('jwt');
    expect(typeof mockResponse.locals?.jwt).toBe('string');
    expect(await verify(mockResponse.locals?.jwt)).toBe(mac);

    // invalid mac
    mockResponse = {
      locals: {},
    };
    mockRequest = { params: { mac: 'Not:valid', password } };
    await createJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).not.toHaveProperty('jwt');

    // invalid password
    mockRequest = { params: { mac, password: 'wrongPass' } };
    await createJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).not.toHaveProperty('jwt');
  });

  test('Validate token', async () => {
    let token: string = await getJWT(mac) as string;
    mockRequest = { params: { token } };

    await validateJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).toHaveProperty('mac');
    expect(mockResponse.locals?.mac).toBe(mac);

    // different token
    token = await getJWT('11:1A:C2:7B:27:1A') as string;
    mockRequest = { params: { token } };
    mockResponse = {
      locals: {},
    };

    await validateJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals?.mac).not.toBe(mac);

    // invalid token
    mockRequest = { params: { token: 'NotAValidToken' } };
    mockResponse = {
      locals: {},
    };

    await validateJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).not.toHaveProperty('mac');

    // unset token
    mockRequest = { params: {} };
    mockResponse = {
      locals: {},
    };

    await validateJWT(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).not.toHaveProperty('mac');
  });
});
