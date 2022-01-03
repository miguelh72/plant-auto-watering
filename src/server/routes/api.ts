import { Router, Request, Response } from 'express';

import registerRouter from './register';
import loginRouter from './login';

const router = Router();

router.use('/register', registerRouter);
router.use('/authenticate', loginRouter);

export default router;
