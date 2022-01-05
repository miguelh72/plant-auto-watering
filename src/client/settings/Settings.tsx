import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { Page, AppState } from './../utils/types';
import { removeDevice } from './../utils/fetch';

export default function Settings({
  device,
  setDevice,
  setView,
}: {
  device: AppState;
  setDevice: (device: AppState | null) => void;
  setView: (view: Page) => void;
}) {
  async function handleDeleteSubmit() {
    removeDevice(
      '/api/register',
      device.token,
      error => console.error(error), // TODO give user feedback
      setDevice,
    )
  }

  return (
    <div id="device">
      <Stack spacing={3} sx={{ padding: 4, borderRadius: 4, backgroundColor: '#fff' }}>

        <Typography variant='h5'><b>Device:</b> MAC {device.mac}</Typography>

        <Stack spacing={1} className='button-controls'>
          <Button variant="outlined" onClick={() => setView(Page.Device)}>Sensor-Pump Pairs</Button>
        </Stack>

        <Stack sx={{ border: '2px solid #999', padding: 2, borderRadius: 2 }} spacing={2}>
          <Typography variant='h5'>Settings</Typography>

          {device.settings &&
            <Stack direction='row' spacing={1}>
              <Typography variant='body1'>Poll Frequency:</Typography>
              <TextField
                sx={{ width: 70 }}
                type="number"
                value={device.settings.pollFrequency}
                variant="standard"
                size='small'
              />
              <Typography variant='body1'> ms</Typography>
            </Stack>
          }

        </Stack>

        <Stack spacing={1} className='button-controls' sx={{ alignItems: 'center' }}>
          <Button variant="contained" color="error" onClick={handleDeleteSubmit}>Delete Device</Button>
        </Stack>

      </Stack>
    </div>
  );
}
