import * as jwt from 'jsonwebtoken';

import * as deviceModel from './../models/devices';
import { ShallowDevice } from './../../shared/types';

const secret = process.env.JWT_SECRET || 'test-secret';

type Payload = { mac: string; };

export async function authenticate(mac: string, passhash: string): Promise<string | null> {
  const shallowDevice: ShallowDevice | null = await deviceModel.readShallowDevice(mac);

  if (!shallowDevice || shallowDevice.passhash !== passhash) return null;

  return new Promise(resolve => {
    jwt.sign({ mac }, secret, (err: Error, token: string) => {
      return resolve(err ? null : token);
    });
  });
}

export async function verify(token: string): Promise<string | null> {
  return new Promise(resolve => {
    jwt.verify(token, secret, (err: jwt.VerifyErrors, decoded: Payload) => {
      return resolve(err ? null : decoded.mac);
    });
  });
}
