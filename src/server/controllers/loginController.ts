import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';

import * as deviceModel from './../models/devices';
import { ShallowDevice } from '../../shared/types';
import { getPasshash, getJWT } from './../utils/authenticate';
import { validateMAC } from './../../shared/validate';

/**
 * Create a jwt.
 * @param req Requires mac and password parameters.
 * @param res If successful, res.locals.jwt will be set. Else, res.locals.error will contain reason. 
 */
export async function createJWT(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { mac, password } = req.params;
  if (!mac || !password || !validateMAC(mac)) {
    res.locals.error = 'Invalid MAC or unset password.';
    return next();
  }

  const passhash = await getPasshash(password);

  const shallowDevice: ShallowDevice | null = await deviceModel.readShallowDevice(mac);
  const isValidPassword = shallowDevice && await bcrypt.compare(password, shallowDevice.passhash);
  if (!shallowDevice || !isValidPassword) {
    res.locals.error = 'Device does not exist or invalid password.';
    return next();
  }

  const jwt = await getJWT(mac);
  if (!jwt) {
    res.locals.error = 'Failed to create JWT.';
    return next();
  }

  res.locals.jwt = jwt;
}
