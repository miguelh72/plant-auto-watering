import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';

import * as deviceModel from './../models/devices';
import { ShallowDevice } from '../../shared/types';
import { getPasshash, getJWT, verify } from './../utils/authenticate';
import { validateMAC } from './../../shared/validate';

/**
 * Create a jwt.
 * @param req Requires mac and password body parameters.
 * @param res If successful, res.locals.jwt will be set. Else, res.locals.error will contain reason. 
 */
export async function createJWT(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { mac, password } = req.body;
  if (!mac || !password || !validateMAC(mac)) {
    res.locals.error = 'Invalid MAC or unset password.';
    return next();
  }

  const shallowDevice: ShallowDevice | null = await deviceModel.readShallowDevice(mac);
  const isValidPassword = shallowDevice && await bcrypt.compare(password, shallowDevice.passhash);
  if (!shallowDevice || !isValidPassword) {
    res.locals.error = 'Device does not exist or invalid password.';
    return next();
  }

  const jwt = await getJWT(mac);
  if (!jwt) {
    res.locals.error = 'Failed to create JWT.';
  } else {
    res.locals.jwt = jwt;
  }

  return next();
}

/**
 * Validate token in either request or response.
 * @param req Requires token body parameters.
 * @param res Optional res.locals.jwt to authenticate. If successful, res.locals.mac will be set. Else, res.locals.error will contain reason. 
 */
export async function validateJWT(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.body.token || res.locals.jwt;
  if (!token) {
    res.locals.error = 'Unset token parameter or res.locals.jwt';
    return next();
  }

  const mac = await verify(token);
  if (!mac || !validateMAC(mac)) {
    res.locals.error = 'Invalid JWT.';
  } else {
    res.locals.mac = mac;
  }

  return next();
}
