import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import './Login.scss';

import { Page } from './../utils/types';
import { validateMAC } from './../../shared/validate';
import { requestAuthorization } from './../utils/fetch';

export default function Login({
  setAuthorization,
  setView,
}: {
  setAuthorization: (mac: string, token: string) => void;
  setView: (view: Page) => void;
}) {
  const [state, setState] = useState({
    errorMessage: '',
    mac: '',
    password: '',
    showPassword: false,
  });

  function handleChange(prop: string) {
    return function (event: React.ChangeEvent<HTMLInputElement>) {
      setState(states => ({ ...states, [prop]: event.target.value }));
    }
  }

  function handleClickShowPassword() {
    setState(state => ({
      ...state,
      showPassword: !state.showPassword,
    }));
  }

  function handleMouseDownPassword(event: React.MouseEvent) {
    event.preventDefault();
  };

  async function handleLoginSubmit() {
    if (!validateMAC(state.mac)) {
      return setState(state => ({ ...state, errorMessage: 'Invalid MAC address format.' }));
    }
    if (state.password.length < 3) {
      // TODO improve password requirements and checking in both client and backend
      return setState(state => ({ ...state, errorMessage: 'Password must be at least 3 characters long.' }));
    }

    await requestAuthorization(
      '/api/authenticate',
      state.mac,
      state.password,
      error => setState(state => ({ ...state, errorMessage: error })),
      setAuthorization
    );
  }

  return (
    <div id="login">
      <Stack spacing={3} sx={{ padding: 4, borderRadius: 4, backgroundColor: '#fff' }}>

        <Typography variant='h4'>Login To Device</Typography>

        {state.errorMessage.length > 0 && <Typography variant='body1' color='error'>{state.errorMessage}</Typography>}

        <TextField
          id="login-mac-input"
          label="Device MAC address"
          variant="outlined"
          value={state.mac}
          onChange={handleChange('mac')}
        />

        <FormControl variant="outlined">
          <InputLabel htmlFor="login-password-input">Password</InputLabel>
          <OutlinedInput
            id="login-password-input"
            type={state.showPassword ? 'text' : 'password'}
            value={state.password}
            onChange={handleChange('password')}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {state.showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>

        <Stack spacing={1}>
          <Button variant="contained" onClick={handleLoginSubmit}>Login</Button>
          <Button variant="outlined" onClick={() => setView(Page.Register)}>Register</Button>
        </Stack>

      </Stack>
    </div>
  );
}