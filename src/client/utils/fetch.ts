import { ClientState, DeviceSetter } from "./../utils/types";
import { Settings, State } from './../../shared/types';

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

export async function authorizationRequest(
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

export async function settingsRequest(
  uri: string,
  token: string,
  setError: (error: string) => void,
  setDevice: DeviceSetter,
): Promise<void> {
  const { body: { settings, error } } = await makeRequest<{ settings: Settings, error: string }>(uri, 'GET', undefined, token);

  if (error) return setError(error);
  setDevice((device: ClientState) => ({ ...device, settings }));
}

export async function statesRequest(
  uri: string,
  token: string,
  setError: (error: string) => void,
  setDevice: DeviceSetter,
): Promise<void> {
  const { body: { states, error } } = await makeRequest<{ states: State[], error: string }>(uri, 'GET', undefined, token);

  if (error) return setError(error);
  setDevice((device: ClientState) => ({ ...device, states }));
}
