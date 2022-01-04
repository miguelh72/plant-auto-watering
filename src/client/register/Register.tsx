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

import './Register.scss';

import { Page } from './../utils/types';
import { validateMAC } from './../../shared/validate';

export default function Register({
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
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
  });

  function handleChange(prop: string) {
    return function (event: React.ChangeEvent<HTMLInputElement>) {
      setState(states => ({ ...states, [prop]: event.target.value }));
    }
  }

  function handleClickShowPassword(prop: keyof typeof state) {
    return function (event: React.MouseEvent) {
      setState(state => ({
        ...state,
        [prop]: !state[prop],
      }));
    }
  }
  function handleMouseDownPassword(event: React.MouseEvent) {
    event.preventDefault();
  };

  async function handleRegisterSubmit() {
    if (!validateMAC(state.mac)) {
      return setState(state => ({ ...state, errorMessage: 'Invalid MAC address format.' }));
    }
    if (state.password !== state.confirmPassword) {
      return setState(state => ({ ...state, errorMessage: 'Passwords do not match.' }));
    }
    if (state.password.length < 3) {
      // TODO improve password requirements and checking in both client and backend
      return setState(state => ({ ...state, errorMessage: 'Password must be at least 3 characters long.' }));
    }

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ mac: state.mac, password: state.password }),
    });
    if (response.status !== 200) {
      return setState(state => ({ ...state, errorMessage: 'Failed to create device. Device may already exist.' }));
    }

    const { token } = await response.json();
    setAuthorization(state.mac, token);
  }

  return (
    <div id="register">
      <Stack spacing={3} sx={{ padding: 4, borderRadius: 4, backgroundColor: '#fff' }}>

        <Typography variant='h4'>Register New Device</Typography>

        {state.errorMessage.length > 0 && <Typography variant='body1' color='error'>{state.errorMessage}</Typography>}

        <TextField
          id="register-mac-input"
          label="Device MAC address"
          variant="outlined"
          value={state.mac}
          onChange={handleChange('mac')}
        />

        <FormControl variant="outlined">
          <InputLabel htmlFor="register-password-input">Password</InputLabel>
          <OutlinedInput
            id="register-password-input"
            type={state.showPassword ? 'text' : 'password'}
            value={state.password}
            onChange={handleChange('password')}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword('showPassword')}
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

        <FormControl variant="outlined">
          <InputLabel htmlFor="register-confirm-password-input">Confirm Password</InputLabel>
          <OutlinedInput
            id="register-confirm-password-input"
            type={state.showConfirmPassword ? 'text' : 'password'}
            value={state.confirmPassword}
            onChange={handleChange('confirmPassword')}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={handleClickShowPassword('showConfirmPassword')}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {state.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Confirm Password"
          />
        </FormControl>

        <Stack spacing={1}>
          <Button variant="contained" onClick={handleRegisterSubmit}>Register</Button>
          <Button variant="outlined" onClick={() => setView(Page.Login)}>Back To Login</Button>
        </Stack>

      </Stack>
    </div>
  );
}