import dotenv from 'dotenv';

dotenv.config();

import express from 'express';

import 'express-async-errors';

import cors from 'cors';

import routes from './routes';

import path from 'path';

import errorHandler from './errors/handler';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use((request, response, next) => {
  next(response.status(404).json({ erro: 'Página não encontrada' }));
});

app.use(errorHandler);

export default app;