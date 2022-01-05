import { Settings, State } from './../../shared/types';

export enum Page {
  Login,
  Register,
  Device,
  Settings,
}

export type ClientState = State & { hasChanges: boolean };

export type AppState = {
  token: string;
  mac: string;
  settings: Settings | null;
  states: ClientState[] | null;
};

export type DeviceSetter = React.Dispatch<React.SetStateAction<AppState | null>>;
