import React, { useState } from 'react';

import Login from './login/Login';
import Register from './register/Register';
import Device from './device/Device';
import Settings from './settings/Settings';
import { Page, ClientState } from './utils/types';

import './App.scss';

export default function App() {
  const [view, setView] = useState<Page>(Page.Login);
  const [device, setDevice] = useState<ClientState | null>({
    mac: '00:1A:C2:7B:00:47', token: 'InvalidToken', settings: { pollFrequency: 1000 }, states: [
      {
        sensor: {
          pin: 14,
          threshold: 100,
          level: 50,
        },
        pump: {
          pin: 6,
          isActive: false,
          speed: 255,
          thresholdOffset: 50,
        }
      }
    ]
  }); // ! reset to (null);

  // Can't access privileged views without a token
  if ((view !== Page.Login && view !== Page.Register) && !device) setView(Page.Login);

  function setToken(mac: string, token: string): void {
    setDevice({ mac, token, settings: null, states: null });
  }

  return (
    <div id="app">
      {view === Page.Login && <Login setToken={setToken} setView={setView} />}
      {view === Page.Register && <Register setToken={setToken} setView={setView} />}
      {view === Page.Device && device && <Device device={device} />}
      {view === Page.Settings && device && <Settings device={device} />}
    </div>
  );
}
