import { Request, Response, NextFunction } from 'express';

import * as deviceModel from './../models/devices';
import { getPasshash } from './../utils/authenticate';
import { Settings, State } from './../../shared/types';
import { validateSettings } from './../../shared/validate';

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

  const settings: Settings | null = await deviceModel.readSettings(res.locals.mac);

  if (!settings) {
    res.locals.error = 'Failed to read settings';
    return next();
  }

  res.locals.settings = settings;
}

/**
 * Retrieve states for a device.
 * @param req Requires res.locals.mac to be set.
 * @param res If successful, res.locals.states will be set. Else, res.locals.error will contain reason.
 */
export async function getStates(req: Request, res: Response, next: NextFunction): Promise<void> {
  // TODO check cache 

  if (!res.locals.mac) {
    res.locals.error = 'res.locals.mac is not set.';
    return next();
  }

  const states: State[] | null = await deviceModel.readStates(res.locals.mac);

  if (!states) {
    res.locals.error = 'Failed to read states';
    return next();
  }

  res.locals.states = states;
}

/**
 * Update password for device.
 * @param req Requires password body parameter and res.locals.mac to be set.
 * @param res If successful, res.locals.successful will be set to true. Else, res.locals.error will contain reason.
 */
export async function updatePassword(req: Request, res: Response, next: NextFunction) {
  // TODO validate password

  const password: string | undefined = req.body.password;
  if (!password || !res.locals.mac) {
    res.locals.error = 'Password body parameter or res.locals.mac are not set.';
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

/**
 * Update settings for device.
 * @param req Requires settings body parameter and res.locals.mac to be set.
 * @param res If successful, res.locals.successful will be set to true. Else, res.locals.error will contain reason.
 */
export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  // TODO update cache

  const settings: Settings | undefined = req.body.settings;
  if (!settings || !res.locals.mac || !validateSettings(settings)) {
    res.locals.error = 'Settings body parameter is not set or invalid, or res.locals.mac are not set.';
    return next();
  }

  const updatedSettings = await deviceModel.updateSettings(res.locals.mac, settings);
  if (!updatedSettings) {
    res.locals.error = 'Failed to update settings.';
    return next();
  }

  res.locals.successful = true;
}
