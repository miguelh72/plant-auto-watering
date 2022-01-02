import { Request, Response, NextFunction } from 'express';

import * as deviceModel from './../models/devices';
import { getPasshash, getJWT } from './../utils/authenticate';
import { validateMAC } from './../../shared/validate';

const defaultPollFrequency = 1000; // ms

/**
 * Create a device.
 * @param req Requires mac and password parameters.
 * @param res If successful, res.locals.jwt will be set. Else, res.locals.error will contain reason.
 */
export async function createDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { mac, password } = req.params;
  if (!mac || !password || !validateMAC(mac)) {
    res.locals.error = 'Invalid MAC or unset password.';
    return next();
  }

  const passhash = await getPasshash(password);

  const createdDevice = await deviceModel.createDevice(mac, passhash, { pollFrequency: defaultPollFrequency }, []);
  if (!createdDevice) {
    res.locals.error = 'Failed to create device.';
    return next();
  }

  const jwt = await getJWT(mac);
  if (!jwt) {
    await deviceModel.removeDevice(mac);
    res.locals.error = 'Failed to create JWT.';
    return next();
  }

  res.locals.jwt = jwt;
}
