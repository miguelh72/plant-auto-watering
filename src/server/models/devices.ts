// TODO implement actual connection to MongoDB
// temporarily implemented in memory for dev

import { Settings, State, Device, ShallowDevice, ClientState, DeviceState } from './../../shared/types';

let devices: Device[] = [];

export async function createDevice(mac: string, passhash: string, settings: Settings, states: State[]): Promise<boolean> {
  const deviceAlreadyExists = devices.some(device => device.mac === mac);
  if (deviceAlreadyExists) return false;

  devices.push({ mac, passhash, settings, states });

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

  devices[deviceIndex].settings = settings;

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

  for (const partialState of newPartialState) {
    const matchingStateIndex = devices[deviceIndex].states.findIndex(state => state.sensor.pin === partialState.sensor.pin);
    if (matchingStateIndex === -1) return false;

    Object.assign(devices[deviceIndex].states[matchingStateIndex].sensor, partialState.sensor);
    Object.assign(devices[deviceIndex].states[matchingStateIndex].pump, partialState.pump);
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
