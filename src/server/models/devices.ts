// TODO implement actual connection to MongoDB
// temporarily implemented in memory for dev

import { Settings, State, Device, ShallowDevice, ClientState, DeviceState } from './../../shared/types';

const DEFAULT_THRESHOLD = 100;
const DEFAULT_SPEED = 255;

let devices: Device[] = [];

function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function createDevice(mac: string, passhash: string, settings: Settings, states: State[]): Promise<boolean> {
  const deviceAlreadyExists = devices.some(device => device.mac === mac);
  if (deviceAlreadyExists) return false;

  devices.push({ mac, passhash, settings: deepCopy(settings), states: deepCopy(states) });

  return true;
}

export async function readShallowDevice(mac: string): Promise<ShallowDevice | null> {
  const deviceIndex = devices.findIndex(device => device.mac === mac);
  if (deviceIndex === -1) return null;

  return { mac: devices[deviceIndex].mac, passhash: devices[deviceIndex].passhash };
}

export async function readSettings(mac: string): Promise<Settings | null> {
  const deviceIndex = devices.findIndex(device => device.mac === mac);
  if (deviceIndex === -1) return null;

  return devices[deviceIndex].settings;
}

export async function readStates(mac: string): Promise<State[] | null> {
  const deviceIndex = devices.findIndex(device => device.mac === mac);
  if (deviceIndex === -1) return null;

  return devices[deviceIndex].states;
}

export async function updatePasshash(mac: string, passhash: string): Promise<boolean> {
  const deviceIndex = devices.findIndex(device => device.mac === mac);
  if (deviceIndex === -1) return false;

  devices[deviceIndex].passhash = passhash;

  return true;
}

export async function updateSettings(mac: string, settings: Settings): Promise<boolean> {
  const deviceIndex = devices.findIndex(device => device.mac === mac);
  if (deviceIndex === -1) return false;

  devices[deviceIndex].settings = deepCopy(settings);

  return true;
}

export async function updateClientStates(mac: string, clientStates: ClientState[]): Promise<boolean> {
  return updateStates(mac, clientStates);
}

export async function updateDeviceStates(mac: string, deviceStates: DeviceState[]): Promise<boolean> {
  return updateStates(mac, deviceStates);
}

function updateStates(mac: string, newPartialState: ClientState[] | DeviceState[]): boolean {
  const deviceIndex = devices.findIndex(device => device.mac === mac);
  if (deviceIndex === -1) return false;

  for (const partialState of newPartialState as State[]) {
    const matchingStateIndex = devices[deviceIndex].states.findIndex(state => state.sensor.pin === partialState.sensor.pin);
    if (matchingStateIndex === -1) {
      // combination does not exist. Add it and return true
      const newState: State = {
        sensor: {
          pin: partialState.sensor.pin,
          threshold: partialState.sensor.threshold || DEFAULT_THRESHOLD,
          level: partialState.sensor.level || 0,
        },
        pump: {
          pin: partialState.pump.pin,
          speed: partialState.pump.speed || DEFAULT_SPEED,
          isActive: partialState.pump.isActive || false,
          thresholdOffset: partialState.pump.thresholdOffset || 0,
        },
      };

      devices[deviceIndex].states.push(newState);
    } else {
      Object.assign(devices[deviceIndex].states[matchingStateIndex].sensor, partialState.sensor);
      Object.assign(devices[deviceIndex].states[matchingStateIndex].pump, partialState.pump);
    }
  }

  return true;
}

export async function removeDevice(mac: string): Promise<boolean> {
  const deviceIndex = devices.findIndex(device => device.mac === mac);
  if (deviceIndex === -1) return false;

  devices.splice(deviceIndex, 1);

  return true;
}

export async function clearDatabase(): Promise<boolean> {
  devices = [];
  return true;
}
