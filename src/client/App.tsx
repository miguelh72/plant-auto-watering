import React, { useState } from 'react';

import Login from './login/Login';
import Register from './register/Register';
import Device from './device/Device';
import Settings from './settings/Settings';
import { Page } from './utils/types';

import './App.scss';

export default function App() {
  const [view, setView] = useState(Page.Register);
  const [token, setToken] = useState<string | null>(null);

  // Can't access privileged views without a token
  if ((view !== Page.Login && view !== Page.Register) && !token) setView(Page.Login);

  return (
    <div id="app">
      {view === Page.Login && <Login setToken={setToken} />}
      {view === Page.Register && <Register setToken={setToken} />}
      {view === Page.Device && <Device token={token} />}
      {view === Page.Settings && <Settings token={token} />}
    </div>
  );
}
