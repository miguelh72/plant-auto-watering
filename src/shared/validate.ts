import { Settings } from './types';

export function validateMAC(mac: string) {
  return new RegExp(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/).test(mac);
}

export function validateSettings(settings: Settings) {
  return typeof settings === 'object'
    && 'pollFrequency' in settings
    && typeof settings.pollFrequency === 'number';
}
