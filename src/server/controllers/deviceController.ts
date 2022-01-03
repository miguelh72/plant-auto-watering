import { Request, Response, NextFunction } from 'express';

import * as deviceModel from './../models/devices';
import { getPasshash } from './../utils/authenticate';

/**
 * Retrieve settings for a device.
 * @param req Requires res.locals.mac to be set.
 * @param res If successful, res.locals.settings will be set. Else, res.locals.error will contain reason.
 */
export async function getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  // TODO check cache 

  if (!res.locals.mac) {
    res.locals.error = 'res.locals.mac is not set.';
    return next();
  }

  const settings = await deviceModel.readSettings(res.locals.mac);

  console.log({ settings }); // ! remove

  if (!settings) {
    res.locals.error = 'Failed to read settings';
    return next();
  }

  res.locals.settings = settings;
}

/**
 * Update password for device.
 * @param req Requires password parameter and res.locals.mac to be set.
 * @param res If successful, res.locals.successful will be set to true. Else, res.locals.error will contain reason.
 */
export async function updatePassword(req: Request, res: Response, next: NextFunction) {
  // TODO validate password

  const password: string | undefined = req.params.password;
  if (!password || !res.locals.mac) {
    res.locals.error = 'Password parameter or res.locals.mac are not set.';
    return next();
  }

  const passhash: string = await getPasshash(password);

  const updatedPassword = await deviceModel.updatePasshash(res.locals.mac, passhash);
  if (!updatedPassword) {
    res.locals.error = 'Failed to update passhash.';
    return next();
  }

  res.locals.successful = true;
}
