import { NextFunction, Request, Response } from 'express';
import connection from '../database/connection';

export default {
  async listarProcedimentos(request: Request, response: Response, next: NextFunction) {
      const procedimentos = await connection('procedimentos').select('*');

      return response.send(procedimentos)
  },
}