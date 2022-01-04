import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { State } from './../../shared/types';

export default function SensorPumpPair({
  state,
  availableSensorPins,
  availablePumpPins,
}: {
  state: State;
  availableSensorPins: number[];
  availablePumpPins: number[];
}) {
  // TODO keep internal copy of state, compare internal vs prop to know if change is pending
  const [hasChanges, setHasChanges] = useState(false);

  availableSensorPins.sort((a, b) => a - b);
  availablePumpPins.sort((a, b) => a - b);

  return (
    <Stack className='sensor-pump-pair' sx={{ border: '2px solid #999', padding: 2, borderRadius: 2 }}>
      <Stack>
        <Typography variant='h4'>Sensor</Typography>
        <Stack sx={{ paddingLeft: 2 }} spacing={1}>

          <Stack direction='row'>
            <Typography variant='body1'>PIN:</Typography>
            <FormControl sx={{ marginLeft: 1, minWidth: 20 }} size='small' variant='standard'>
              <Select
                value={state.sensor.pin}
                onChange={e => console.log(e)}
                autoWidth
                label="Sensory PIN"
              >
                {availableSensorPins.map(pin => <MenuItem key={pin} value={pin}>{pin}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction='row'>
            <Typography variant='body1'>Threshold:</Typography>
            <TextField
              sx={{ marginLeft: 1, width: 45 }}
              type="number"
              value={state.sensor.threshold}
              variant="standard"
              size='small'
            />
            <Typography variant='body1'> / 255</Typography>
          </Stack>

          <Typography variant='body1'>Current Value: {state.sensor.level} / 255</Typography>
        </Stack>
      </Stack>

      <Stack marginTop={2}>
        <Typography variant='h4'>Pump</Typography>
        <Stack sx={{ paddingLeft: 2 }} spacing={1}>

          <Stack direction='row'>
            <Typography variant='body1'>PIN:</Typography>
            <FormControl sx={{ marginLeft: 1, minWidth: 20 }} size='small' variant='standard'>
              <Select
                value={state.pump.pin}
                onChange={e => console.log(e)}
                autoWidth
                label="Pump PIN"
              >
                {availablePumpPins.map(pin => <MenuItem key={pin} value={pin}>{pin}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction='row'>
            <Typography variant='body1'>Speed:</Typography>
            <TextField
              sx={{ marginLeft: 1, width: 45 }}
              type="number"
              value={state.pump.speed}
              variant="standard"
              size='small'
            />
            <Typography variant='body1'> / 255</Typography>
          </Stack>

          <Typography variant='body1'>Active: {state.pump.isActive ? 'Yes' : 'No'}</Typography>

          <Typography variant='body1'>Threshold Offset: {state.pump.thresholdOffset} ms</Typography>
        </Stack>
      </Stack>

      <Stack direction='row'>
        {hasChanges && <Button variant="contained" sx={{ maxWidth: 120, marginTop: 2 }}>Save</Button>}
        <Button variant="outlined" color="error" sx={{ maxWidth: 120, marginTop: 2, marginLeft: 'auto' }}>Remove</Button>
      </Stack>
    </Stack>
  );
}