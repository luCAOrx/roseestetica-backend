import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import path from 'path';

import ClienteController from './controllers/ClienteController';
import errorHandler from './errors/handler';
import authMiddleware from './middlewares/authMidleware';
import routes from './routes';

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
