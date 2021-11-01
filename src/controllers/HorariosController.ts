import { NextFunction, Request, Response } from 'express';
import connection from '../database/connection';

export default {
  async listarHorarios(request: Request, response: Response, next: NextFunction) {
      const horarios = await connection('horarios').select('*');

      return response.json(horarios)
  },
}