import { NextFunction, Request, Response } from 'express';
import connection from '../database/connection';

export default {
  async listarCidades(request: Request, response: Response, next: NextFunction) {
    const cidades = await connection('cidades').select('*');
  
    return response.send(cidades);
  }
};