import { Router, Request, Response } from 'express';

import * as loginController from './../controllers/loginController';

const router = Router();

router.post('/',
  loginController.createJWT,
  (req: Request, res: Response) => {
    if (res.locals.error || !res.locals.jwt) {
      console.log(res.locals.error);
      return res.status(400).json({ error: 'Failed to authenticate.' });
    }

    res.json({ token: res.locals.jwt })
  }
);

export default router;
