import { response } from "express";

async function makeRequest<T>(
  uri: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body: Object
): Promise<{ status: number; body: T; }> {

  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  if (method !== 'GET') {
    headers['Content-Type'] = 'application/json';
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
  const { status, body: { token, error } } = await makeRequest(uri, 'POST', { mac, password });

  if (error) return setError(error);
  setAuthorization(mac, token);
}
