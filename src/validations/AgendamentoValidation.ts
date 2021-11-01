import { NextFunction, Request, Response } from "express";

import * as yup from 'yup';

export default {
  async agendar(request: Request, response: Response, next: NextFunction) {
    const { data, procedimento_id, horario_id } = request.body;

    const dataRequest = { data, procedimento_id, horario_id };
     
    const schema = yup.object().shape({
      data: yup.date().required('O campo data é obrigatório.'),
      procedimento_id: yup.array().min(1, 'O campo procedimento é obrigatório.'),
      horario_id: yup.number().required('O campo horário é obrigatório.')
    });

    await schema.validate(dataRequest, {
      abortEarly: false
    });

    next();
  },

  async remarcar(request: Request, response: Response, next: NextFunction) {
    const { data, horario_id } = request.body;

    const dataRequest = { data, horario_id };
     
    const schema = yup.object().shape({
      data: yup.date().required('O campo data é obrigatório.'),
      horario_id: yup.number().required('O campo horário é obrigatório.')
    });

    await schema.validate(dataRequest, {
      abortEarly: false
    });

    next();
  },

  async alterarProcedimento(request: Request, response: Response, next: NextFunction) {
    const { procedimento_id } = request.body;

    const dataRequest = { procedimento_id };
     
    const schema = yup.object().shape({
      procedimento_id: yup.array().min(1, 'O campo procedimento é obrigatório.'),
    });

    await schema.validate(dataRequest, {
      abortEarly: false
    });

    next();
  }
}