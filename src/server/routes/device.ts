import { Router, Request, Response } from 'express';

import * as loginController from './../controllers/loginController';
import * as deviceController from './../controllers/deviceController';

const router = Router();

router.get('/settings',
  loginController.validateJWT,
  deviceController.getSettings,
  (req: Request, res: Response) => {
    if (!res.locals.mac) {
      console.log(res.locals.error);
      return res.status(400).json({ error: 'Failed to authenticate.' });
    }
    if (res.locals.error || !res.locals.settings) {
      console.log(res.locals.error);
      return res.status(500).json({ error: 'Failed to retrieve device settings.' });
    }

    res.json({ settings: res.locals.settings });
  }
);

router.get('/states',
  loginController.validateJWT,
  deviceController.getStates,
  (req: Request, res: Response) => {
    if (!res.locals.mac) {
      console.log(res.locals.error);
      return res.status(400).json({ error: 'Failed to authenticate.' });
    }
    if (res.locals.error || !res.locals.states) {
      console.log(res.locals.error);
      return res.status(500).json({ error: 'Failed to retrieve device states.' });
    }

    res.json({ states: res.locals.states });
  }
);

export default router;
