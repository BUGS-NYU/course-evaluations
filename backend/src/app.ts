import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/error-handler';
import { connectToDB, disconnectFromDB } from './db';
import { coursesRouter } from './routes/courses';
import { PORT } from './constants';

const app = express();

connectToDB();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', coursesRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}/`);
});

const close = () => disconnectFromDB();

export default close;
