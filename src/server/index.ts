import express from 'express';

import apiRouter from './routes/api';

const PORT: number = (process.env.PORT && parseInt(process.env.PORT)) || 3000;
const HOST: string = process.env.HOST || 'localhost';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', apiRouter);

// Launch Server
if (process.env.NODE_ENV !== 'test') { // otherwise supertest keeps connection live
  app.listen(PORT, HOST, () => console.log(`Server listening at http://${HOST}:${PORT}/`));
}

export default app;
