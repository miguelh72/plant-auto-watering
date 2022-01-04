import React, { useState } from 'react';

import Login from './login/Login';
import Register from './register/Register';
import Device from './device/Device';
import Settings from './settings/Settings';
import { Page, ClientState } from './utils/types';

import './App.scss';

export default function App() {
  const [view, setView] = useState<Page>(Page.Login);
  const [device, setDevice] = useState<ClientState | null>(null);

  // Can't access privileged views without a token
  if ((view !== Page.Login && view !== Page.Register) && !device) setView(Page.Login);

  function setAuthorization(mac: string, token: string): void {
    setDevice({ mac, token, settings: null, states: null });
    setView(Page.Device);
  }

  return (
    <div id="app">
      {view === Page.Login && <Login setAuthorization={setAuthorization} setView={setView} />}
      {view === Page.Register && <Register setAuthorization={setAuthorization} setView={setView} />}
      {view === Page.Device && device && <Device device={device} setDevice={setDevice} />}
      {view === Page.Settings && device && <Settings device={device} setDevice={setDevice} />}
    </div>
  );
}
