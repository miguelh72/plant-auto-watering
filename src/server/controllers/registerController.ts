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

/**
 * Remove a device.
 * @param req Requires res.locals.mac to be set.
 * @param res If successful, res.locals.successful will be set to true. Else, res.locals.error will contain reason.
 */
export async function removeDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!res.locals.mac) {
    res.locals.error = 'res.locals.mac is not set.';
    return next();
  }

  const deviceRemoved = await deviceModel.removeDevice(res.locals.mac);
  if (!deviceRemoved) {
    res.locals.error = 'Unable to remove device.';
    return next();
  }

  res.locals.successful = true;
}
