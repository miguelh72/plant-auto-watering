import { Request, Response, NextFunction } from 'express';

import * as deviceModel from './../models/devices';
import { createJWT } from './loginController';
import { getPasshash, verify } from './../utils/authenticate';


describe('Test register controller', () => {
  const mac = '00:1A:C2:7B:00:47';
  const password = 'test-password';

  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(async () => {
    await deviceModel.clearDatabase();

    mockRequest = { params: { mac, password } };
    mockResponse = {
      locals: {},
    };
  });

  afterAll(async () => {
    await deviceModel.clearDatabase();
  });

  test('Login to device', async () => {
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
});
