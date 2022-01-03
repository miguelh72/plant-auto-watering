import * as express from 'express';

const PORT: number = (process.env.PORT && parseInt(process.env.PORT)) || 3000;
const HOST: string = process.env.HOST || 'localhost';

const app = express();

app.use(express.json());

app.get('*', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, HOST, () => console.log(`Server listening at http://${HOST}:${PORT}`));

export default app;
