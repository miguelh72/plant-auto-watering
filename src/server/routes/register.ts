import { Router, Request, Response } from 'express';

import * as loginController from './../controllers/loginController';
import * as registerController from './../controllers/registerController';

const router = Router();

router.post('/',
  registerController.createDevice,
  (req: Request, res: Response) => {
    if (res.locals.error || !res.locals.jwt) {
      console.log(res.locals.error);
      return res.status(400).json({ error: 'Failed to create device. Device may already exist.' });
    }

    res.json({ token: res.locals.jwt })
  }
);

router.delete('/',
  loginController.validateJWT,
  registerController.removeDevice,
  (req: Request, res: Response) => {
    if (!res.locals.mac) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (res.locals.error || !res.locals.successful) {
      console.log(res.locals.error);
      return res.status(500).json({ error: `Failed to remove device with MAC ${res.locals.mac}.` });
    }

    res.json({ message: 'Device successfully removed.' })
  }
);

export default router;
