import { AppState, DeviceSetter, ClientState } from "./../utils/types";
import { Settings, State, ClientState as BackendClientState } from './../../shared/types';

// TODO handle retries

async function makeRequest<T>(
  uri: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: Object,
  token?: string,
): Promise<{ status: number; body: T; }> {

  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  if (method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Token'] = token;
  }

  const response: Response = await fetch(uri, { method, headers, body: JSON.stringify(body) });
  const responseBody: T = await response.json();

  return { status: response.status, body: responseBody };
}

export async function requestAuthorization(
  uri: string,
  mac: string,
  password: string,
  setError: (error: string) => void,
  setAuthorization: (mac: string, token: string) => void,
): Promise<void> {
  const { body: { token, error } } = await makeRequest<{ token: string, error?: string }>(uri, 'POST', { mac, password });

  if (error) return setError(error);
  setAuthorization(mac, token);
}

export async function requestSettings(
  uri: string,
  token: string,
  setError: (error: string) => void,
  setDevice: DeviceSetter,
): Promise<void> {
  const { body: { settings, error } } = await makeRequest<{ settings: Settings, error: string }>(uri, 'GET', undefined, token);

  if (error) return setError(error);
  setDevice((device: AppState) => ({ ...device, settings }));
}

export async function requestStates(
  uri: string,
  token: string,
  setError: (error: string) => void,
  setDevice: DeviceSetter,
): Promise<void> {
  const { body: { states, error } } = await makeRequest<{ states: State[], error: string }>(uri, 'GET', undefined, token);

  if (error) return setError(error);

  const clientStates: ClientState[] = states.map((state: ClientState) => {
    state.hasChanges = false;
    return state;
  });

  setDevice((device: AppState) => ({
    ...device,
    states: clientStates,
  }));
}

export async function removeDevice(
  uri: string,
  token: string,
  setError: (error: string) => void,
  setDevice: DeviceSetter,
): Promise<void> {
  const { body: { error } } = await makeRequest<{ message: string, error: string }>(uri, 'DELETE', undefined, token);

  if (error) return setError(error);
  setDevice(null);
}

export async function updateStates(
  uri: string,
  token: string,
  states: ClientState[],
  setError: (error: string) => void,
  setDevice: DeviceSetter,
): Promise<void> {
  const backendClientState: BackendClientState[] = states.map(state => ({
    sensor: {
      pin: state.sensor.pin,
      threshold: state.sensor.threshold,
    },
    pump: {
      pin: state.pump.pin,
      speed: state.pump.speed,
    }
  }));

  const { body: { error } } = await makeRequest<{ message: string, error: string }>(uri, 'PATCH', { states: backendClientState }, token);

  if (error) return setError(error);

  setDevice(device => {
    if (!device || !device.states) return device;
    return { ...device, states: device.states.map(state => ({ ...state, hasChanges: false })) };
  });
}