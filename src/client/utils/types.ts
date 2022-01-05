import { Settings, State } from './../../shared/types';

export enum Page {
  Login,
  Register,
  Device,
  Settings,
}

export type ClientState = {
  token: string;
  mac: string;
  settings: Settings | null;
  states: State[] | null;
};

export type DeviceSetter = ((setterFunc: (device: ClientState | null) => void) => void)
  & ((device: ClientState | null) => void);
