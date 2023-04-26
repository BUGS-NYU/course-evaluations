import { connectToDB, disconnectFromDB } from './db';
import express from 'express';
import { coursesRouter } from './routes/courses';

const PORT = 3002;
const app = express();

connectToDB();

app.use(express.json());
app.use('/', coursesRouter);
app.listen(PORT, () => {
  console.log('Running on http://localhost:3002/');
});

const close = () => disconnectFromDB();

export default close;
