import { NextFunction, Request, Response } from 'express';
import connection from '../database/connection';

export default {
  async listarGeneros(request: Request, response: Response, next: NextFunction) {
      const generos = await connection('sexos').select('*');

      return response.send(generos)
  },
}