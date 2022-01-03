import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import * as deviceModel from '../models/devices';
import { ShallowDevice } from '../../shared/types';
import { validateMAC } from './../../shared/validate';

const secret: string = process.env.JWT_SECRET || 'test-secret';
const expiresIn: number = (process.env.JWT_EXPIRED_IN && parseInt(process.env.JWT_EXPIRED_IN)) || 1000 * 60 * 60 * 72;
const saltRounds: number = (process.env.SALT_ROUNDS && parseInt(process.env.SALT_ROUNDS)) || 10;

type Payload = { mac: string; };

export async function authenticate(mac: string, password: string): Promise<string | null> {
  const shallowDevice: ShallowDevice | null = await deviceModel.readShallowDevice(mac);
  if (!shallowDevice) return null;

  const isValidPassword = await bcrypt.compare(password, shallowDevice.passhash);
  if (!isValidPassword) return null;

  return getJWT(mac);
}

export async function getJWT(mac: string): Promise<string | null> {
  if (!validateMAC(mac)) return null;

  return new Promise(resolve => {
    jwt.sign({ mac }, secret, { expiresIn }, (err: Error, token: string) => {
      return resolve(err ? null : token);
    });
  });
}

export async function getPasshash(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function verifyToken(token: string): Promise<string | null> {
  return new Promise(resolve => {
    jwt.verify(token, secret, (err: jwt.VerifyErrors, decoded: Payload) => {
      return resolve(err ? null : decoded.mac);
    });
  });
}
