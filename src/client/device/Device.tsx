import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import './Device.scss';

import { ClientState } from './../utils/types';
import SensorPumpPair from './SensorPumpPair';

// TODO make this a setting or let user type pin directly, need to research how arduino code names pins
const SENSOR_PINS: number[] = [14, 15, 16, 17, 18, 19, 20, 21];
const PUMP_PINS: number[] = [3, 5, 6, 9, 10];

export default function Device({
  device,
}: {
  device: ClientState;
}) {
  const usedPins: Set<number> = !device.states
    ? new Set<number>()
    : device.states.reduce((usedPins, state) => {
      usedPins.add(state.sensor.pin);
      usedPins.add(state.pump.pin);
      return usedPins;
    }, new Set<number>());

  const availableSensorPins: number[] = SENSOR_PINS.filter(pin => !usedPins.has(pin));
  const availablePumpPins: number[] = PUMP_PINS.filter(pin => !usedPins.has(pin));;

  // TODO add splash screen if device.settings or device.states has not been loaded

  return (
    <div id="device">
      <Stack spacing={3} sx={{ padding: 4, borderRadius: 4, backgroundColor: '#fff' }}>

        <Typography variant='h5'><b>Device:</b> MAC {device.mac}</Typography>

        <Stack spacing={1} className='button-controls'>
          <Button variant="outlined">Edit Device Settings</Button>
          <Button variant="contained">Add Sensor-Pump Pair</Button>
        </Stack>

        {
          (!device.states || device.states.length === 0) &&
          <Stack sx={{ border: '2px solid #999', padding: 2, borderRadius: 2 }}>
            <Typography variant='body1'>To begin configuring your device, click above to add a sensor and pump pair settings.
              You will then be able to edit the pin, speed, and thresholds for that sensor-pump combination.</Typography>
          </Stack>
        }

        {
          device.states && device.states.map(state => <SensorPumpPair
            key={state.sensor.pin.toString() + state.pump.pin}
            state={state}
            availableSensorPins={[...availableSensorPins, state.sensor.pin]}
            availablePumpPins={[...availablePumpPins, state.pump.pin]}
          />)
        }

        <Stack spacing={1} className='button-controls' sx={{ alignItems: 'center' }}>
          <Button variant="contained" color="error">Logout</Button>
        </Stack>

      </Stack>
    </div>
  );
}