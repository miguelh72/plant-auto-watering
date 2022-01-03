import { Request, Response, NextFunction } from 'express';

import * as deviceModel from './../models/devices';
import { getPasshash } from './../utils/authenticate';
import { ClientState, DeviceState, Settings, State } from './../../shared/types';
import { validateSettings, validateClientStates, validateDeviceStates } from './../../shared/validate';

/**
 * Retrieve settings for a device.
 * @param req Requires res.locals.mac to be set.
 * @param res If successful, res.locals.settings will be set. Else, res.locals.error will contain reason.
 */
export async function getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  // TODO check cache 

  if (res.locals.error) return next();

  if (!res.locals.mac) {
    res.locals.error = 'res.locals.mac is not set.';
    return next();
  }

  const settings: Settings | null = await deviceModel.readSettings(res.locals.mac);

  if (!settings) {
    res.locals.error = 'Failed to read settings';
  } else {
    res.locals.settings = settings;
  }

  return next();
}

/**
 * Retrieve states for a device.
 * @param req Requires res.locals.mac to be set.
 * @param res If successful, res.locals.states will be set. Else, res.locals.error will contain reason.
 */
export async function getStates(req: Request, res: Response, next: NextFunction): Promise<void> {
  // TODO check cache 

  if (res.locals.error) return next();

  if (!res.locals.mac) {
    res.locals.error = 'res.locals.mac is not set.';
    return next();
  }

  const states: State[] | null = await deviceModel.readStates(res.locals.mac);

  if (!states) {
    res.locals.error = 'Failed to read states';
  } else {
    res.locals.states = states;
  }

  return next();
}

/**
 * Update password for device.
 * @param req Requires password body parameter and res.locals.mac to be set.
 * @param res If successful, res.locals.successful will be set to true. Else, res.locals.error will contain reason.
 */
export async function updatePassword(req: Request, res: Response, next: NextFunction) {
  // TODO validate password

  if (res.locals.error) return next();

  const password: string | undefined = req.body.password;
  if (!password || !res.locals.mac) {
    res.locals.error = 'Password body parameter or res.locals.mac are not set.';
    return next();
  }

  const passhash: string = await getPasshash(password);

  const updatedPassword = await deviceModel.updatePasshash(res.locals.mac, passhash);
  if (!updatedPassword) {
    res.locals.error = 'Failed to update passhash.';
  } else {
    res.locals.successful = true;
  }

  return next();
}

/**
 * Update settings for device.
 * @param req Requires settings body parameter and res.locals.mac to be set.
 * @param res If successful, res.locals.successful will be set to true. Else, res.locals.error will contain reason.
 */
export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  // TODO update cache

  if (res.locals.error) return next();

  const settings: Settings | undefined = req.body.settings;
  if (!settings || !res.locals.mac || !validateSettings(settings)) {
    res.locals.error = 'Settings body parameter is not set or invalid, or res.locals.mac are not set.';
    return next();
  }

  const updatedSettings = await deviceModel.updateSettings(res.locals.mac, settings);
  if (!updatedSettings) {
    res.locals.error = 'Failed to update settings.';
  } else {
    res.locals.successful = true;
  }

  return next();
}

/**
 * Update client states for device.
 * @param req Requires states body parameter and res.locals.mac to be set.
 * @param res If successful, res.locals.successful will be set to true. Else, res.locals.error will contain reason.
 */
export async function updateClientStates(req: Request, res: Response, next: NextFunction) {
  // TODO update cache

  if (res.locals.error) return next();

  const clientStates: ClientState[] | undefined = req.body.states;
  if (!clientStates || !res.locals.mac || !validateClientStates(clientStates)) {
    res.locals.error = 'States body parameter is not set or invalid, or res.locals.mac are not set.';
    return next();
  }

  const updatesStates = await deviceModel.updateClientStates(res.locals.mac, clientStates);
  if (!updatesStates) {
    res.locals.error = 'Failed to update client states.';
  } else {
    res.locals.successful = true;
  }

  return next();
}

/**
 * Update client states for device.
 * @param req Requires states body parameter and res.locals.mac to be set.
 * @param res If successful, res.locals.successful will be set to true. Else, res.locals.error will contain reason.
 */
export async function updateDeviceStates(req: Request, res: Response, next: NextFunction) {
  // TODO update cache

  if (res.locals.error) return next();

  const deviceStates: DeviceState[] | undefined = req.body.states;
  if (!deviceStates || !res.locals.mac || !validateDeviceStates(deviceStates)) {
    res.locals.error = 'States body parameter is not set or invalid, or res.locals.mac are not set.';
    return next();
  }

  const updatesStates = await deviceModel.updateDeviceStates(res.locals.mac, deviceStates);
  if (!updatesStates) {
    res.locals.error = 'Failed to update client states.';
  } else {
    res.locals.successful = true;
  }

  return next();
}
