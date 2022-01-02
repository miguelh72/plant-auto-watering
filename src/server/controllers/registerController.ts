import { Request, Response, NextFunction } from 'express';

import * as deviceModel from './../models/devices';
import { getPasshash, getJWT } from './../utils/authenticate';
import { validateMAC } from './../../shared/validate';

const defaultPollFrequency = 1000; // ms

export async function createDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { mac, password } = req.params;
  if (!mac || !password || !validateMAC(mac)) return next();

  const passhash = await getPasshash(password);

  const createdDevice = await deviceModel.createDevice(mac, passhash, { pollFrequency: defaultPollFrequency }, []);
  if (!createdDevice) return next();

  const jwt = await getJWT(mac);
  if (!jwt) {
    await deviceModel.removeDevice(mac);
    return next();
  }

  res.locals.jwt = jwt;
}
