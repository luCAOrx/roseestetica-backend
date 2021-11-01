import { NextFunction, Request, Response } from 'express';

import jwt from 'jsonwebtoken';

import authConfig from '../config/auth';

export default function authentication(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization;

  if(!authHeader)
    return response.status(401).send({ erro: 'Nenhum token fornecido!' });

  const parts = authHeader.split(' ');

  if(Number(!parts.length) === 2)
    return response.status(401).send({ erro: 'Erro de token!' });

  const [ scheme, token ] = parts;

  if(!/^Bearer$/i.test(scheme))
    return response.status(401).send({ erro: 'Token malformatado!' });

  jwt.verify(token, authConfig.secret, (err, decoded: any) => {
    if(err) return response.status(401).send({ erro: 'Token inválido!' });

    request.clientId = decoded.id;
    
    return next();
  });
};