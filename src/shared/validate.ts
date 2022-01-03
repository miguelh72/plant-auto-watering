// TODO add tests

import { ClientState, DeviceState, Settings } from './types';

export function validateMAC(mac: string): boolean {
  return new RegExp(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/).test(mac);
}

export function validateSettings(settings: Settings): boolean {
  return typeof settings === 'object'
    && 'pollFrequency' in settings
    && typeof settings.pollFrequency === 'number';
}

export function validateClientStates(clientStates: ClientState[]): boolean {
  return clientStates instanceof Array && clientStates.every(clientState => validateClientState(clientState));
}
function validateClientState(clientState: ClientState): boolean {
  return typeof clientState === 'object'
    && 'sensor' in clientState
    && 'pump' in clientState
    && 'pin' in clientState.sensor
    && 'threshold' in clientState.sensor
    && 'pin' in clientState.pump
    && 'speed' in clientState.pump;
}

export function validateDeviceStates(deviceStates: DeviceState[]): boolean {
  return deviceStates instanceof Array && deviceStates.every(clientState => validateDeviceState(clientState));
}
function validateDeviceState(clientState: DeviceState): boolean {
  return typeof clientState === 'object'
    && 'sensor' in clientState
    && 'pump' in clientState
    && 'pin' in clientState.sensor
    && 'level' in clientState.sensor
    && 'pin' in clientState.pump
    && 'isActive' in clientState.pump
    && 'thresholdOffset' in clientState.pump;
}