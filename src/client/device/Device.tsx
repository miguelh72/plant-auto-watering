import React, { useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import './Device.scss';

import { Page, AppState, DeviceSetter, ClientState } from './../utils/types';
import { State } from './../../shared/types';
import SensorPumpPair from './SensorPumpPair';
import Splash from './../shared/Splash';
import { requestSettings, requestStates, updateStates } from './../utils/fetch';

// TODO make this a setting or let user type pin directly, need to research how arduino code names pins
const SENSOR_PINS: number[] = [14, 15, 16, 17, 18, 19, 20, 21];
const PUMP_PINS: number[] = [3, 5, 6, 9, 10];

const DEFAULT_THRESHOLD = 100;
const DEFAULT_SPEED = 255;

function getStateKey(state: State) {
  return state.sensor.pin.toString() + '-' + state.pump.pin
}

export default function Device({
  device,
  setDevice,
  setView,
}: {
  device: AppState;
  setDevice: DeviceSetter;
  setView: (view: Page) => void;
}) {

  const usedPins: Set<number> = !device.states
    ? new Set<number>()
    : device.states.reduce((usedPins, state) => {
      usedPins.add(state.sensor.pin);
      usedPins.add(state.pump.pin);
      return usedPins;
    }, new Set<number>());

  const availableSensorPins: number[] = SENSOR_PINS.filter(pin => !usedPins.has(pin));
  const availablePumpPins: number[] = PUMP_PINS.filter(pin => !usedPins.has(pin));

  function addNewPair(): void {
    if (availableSensorPins.length === 0 || availablePumpPins.length === 0) return;

    const newState: ClientState = {
      sensor: {
        pin: availableSensorPins.pop() as number,
        threshold: DEFAULT_THRESHOLD,
        level: 0,
      },
      pump: {
        pin: availablePumpPins.pop() as number,
        speed: DEFAULT_SPEED,
        isActive: false,
        thresholdOffset: 0,
      },
      hasChanges: true,
    };

    setDevice(device => {
      if (!device) return device;
      return { ...device, states: !device.states ? [newState] : [...device.states, newState] };
    });
  }

  async function saveState(): Promise<void> {
    return updateStates(
      '/api/device/states/client',
      device.token,
      device.states || [],
      error => console.error(error), // TODO give user feedback
      setDevice
    );
  }

  async function removeState(index: number): Promise<void> {
    setDevice(device => {
      if (!device || !device.states) return device;
      return { ...device, states: [...device.states.slice(0, index), ...device.states.slice(index + 1)] };
    });

    saveState();
  }

  useEffect(() => {
    // On component did mount, load settings and state
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

  return (
    <div id="device">

      <Stack spacing={3} sx={{ padding: 4, borderRadius: 4, backgroundColor: '#fff' }}>

        <Typography variant='h5'><b>Device:</b> MAC {device.mac}</Typography>

        {(device.settings && device.states)
          ? <>
            <Stack spacing={1} className='button-controls'>
              <Button variant="outlined" onClick={() => setView(Page.Settings)}>Edit Device Settings</Button>
              {availableSensorPins.length > 0 && availablePumpPins.length > 0 && <Button variant="contained" onClick={addNewPair}>Add Sensor-Pump Pair</Button>}
            </Stack>

            {
              (device?.states.length === 0) &&
              <Stack sx={{ border: '2px solid #999', padding: 2, borderRadius: 2 }}>
                <Typography variant='body1'>To begin configuring your device, click above to add a sensor and pump pair settings.
                  You will then be able to edit the pin, speed, and thresholds for that sensor-pump combination.</Typography>
              </Stack>
            }

            {
              device?.states.map((state, i) => {
                return <SensorPumpPair
                  key={getStateKey(state)}
                  state={state}
                  availableSensorPins={[...availableSensorPins, state.sensor.pin]}
                  availablePumpPins={[...availablePumpPins, state.pump.pin]}
                  showSaveButton={state.hasChanges}
                  saveState={saveState}
                  removeState={() => removeState(i)}
                />
              })
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
