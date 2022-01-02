import { Request, Response, NextFunction } from 'express';

import * as deviceModel from './../models/devices';
import { createDevice } from './registerController';


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

  test('Create new device', async () => {
    await createDevice(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).toHaveProperty('jwt');

    // try to create a duplicate device
    mockResponse = {
      locals: {},
    };
    await createDevice(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).not.toHaveProperty('jwt');

    // try to create an entry with invalid mac
    mockRequest = { params: { mac: 'Not:Mac', password } };
    await createDevice(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.locals).not.toHaveProperty('jwt');
  });
});
