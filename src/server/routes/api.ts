import { Router, Request, Response } from 'express';

import registerRouter from './register';
import loginRouter from './login';
import deviceRouter from './device';

const router = Router();

router.use('/register', registerRouter);
router.use('/authenticate', loginRouter);
router.use('/device', deviceRouter);

export default router;
