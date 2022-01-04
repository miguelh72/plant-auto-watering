import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { ClientState } from './../utils/types';

export default function Settings({
  device,
  setDevice,
}: {
  device: ClientState;
  setDevice: (device: ClientState | null) => void;
}) {
  return (
    <div id="device">
      <Stack spacing={3} sx={{ padding: 4, borderRadius: 4, backgroundColor: '#fff' }}>

        <Typography variant='h5'><b>Device:</b> MAC {device.mac}</Typography>

        <Stack spacing={1} className='button-controls'>
          <Button variant="outlined">Sensor-Pump Pairs</Button>
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
          <Button variant="contained" color="error">Delete Device</Button>
        </Stack>

      </Stack>
    </div>
  );
}
