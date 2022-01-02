export type Settings = {
  pollFrequency: number;
};

export type ClientSensorState = {
  pin: number;
  threshold: number;
};
export type DeviceSensorState = {
  pin: number;
  level: number;
};
export type SensorState = ClientSensorState & DeviceSensorState;

export type ClientPumpState = {
  pin: number;
  speed: number;
};
export type DevicePumpState = {
  pin: number;
  isActive: boolean;
  thresholdOffset: number;
};
export type PumpState = ClientPumpState & DevicePumpState;

export type ClientState = {
  sensor: ClientSensorState;
  pump: ClientPumpState;
};
export type DeviceState = {
  sensor: DeviceSensorState;
  pump: DevicePumpState;
};
export type State = ClientState & DeviceState;

export type ShallowDevice = {
  mac: string;
  passhash: string;
};
export type Device = ShallowDevice & {
  settings: Settings;
  states: State[];
};

export type JWTPayload = {
  mac: string;
};
