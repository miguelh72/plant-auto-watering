import React, { useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import './Device.scss';

import { Page, ClientState, DeviceSetter } from './../utils/types';
import SensorPumpPair from './SensorPumpPair';
import Splash from './../shared/Splash';
import { requestSettings, requestStates } from './../utils/fetch';

// TODO make this a setting or let user type pin directly, need to research how arduino code names pins
const SENSOR_PINS: number[] = [14, 15, 16, 17, 18, 19, 20, 21];
const PUMP_PINS: number[] = [3, 5, 6, 9, 10];

export default function Device({
  device,
  setDevice,
  setView,
}: {
  device: ClientState;
  setDevice: DeviceSetter;
  setView: (view: Page) => void;
}) {
  useEffect(() => {
    // On component did mount, load settings and state
    // TODO handle failure retries
    requestSettings(
      '/api/device/settings',
      device.token,
      error => console.error(error),
      setDevice
    );
    requestStates(
      '/api/device/states',
      device.token,
      error => console.error(error),
      setDevice
    );
  }, []);

  const usedPins: Set<number> = !device.states
    ? new Set<number>()
    : device.states.reduce((usedPins, state) => {
      usedPins.add(state.sensor.pin);
      usedPins.add(state.pump.pin);
      return usedPins;
    }, new Set<number>());

  const availableSensorPins: number[] = SENSOR_PINS.filter(pin => !usedPins.has(pin));
  const availablePumpPins: number[] = PUMP_PINS.filter(pin => !usedPins.has(pin));;

  return (
    <div id="device">

      <Stack spacing={3} sx={{ padding: 4, borderRadius: 4, backgroundColor: '#fff' }}>

        <Typography variant='h5'><b>Device:</b> MAC {device.mac}</Typography>

        {(device.settings && device.states)
          ? <>
            <Stack spacing={1} className='button-controls'>
              <Button variant="outlined" onClick={() => setView(Page.Settings)}>Edit Device Settings</Button>
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
          </>
          : <Splash />
        }

        <Stack spacing={1} className='button-controls' sx={{ alignItems: 'center' }}>
          <Button variant="contained" color="error" onClick={() => setDevice(null)}>Logout</Button>
        </Stack>

      </Stack>
    </div >
  );
}