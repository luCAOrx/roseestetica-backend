import { Request, Response, NextFunction } from "express";

import * as yup from 'yup';

export default {
  // ADMIN
  async cadastrar(request: Request, response: Response, next: NextFunction) {
    const { email, senha } = request.body;

    const data = { email, senha };

    const schema = yup.object().shape({
      email: yup.string().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .email("O campo e-mail precisa ser um e-mail válido!")
        .max(80, "No máximo 80 caracteres!")
        .required("O campo email é obrigatório!"),
      senha: yup.string().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .min(8, "No mínimo 8 caracteres!")
        .max(50, "No máximo 50 caracteres!")
        .required("O campo senha é obrigatório!"),
    });
  
    await schema.validate(data, {
      abortEarly: false
    });

    next();
  },

  async atualizarDadosDeLogin(request: Request, response: Response, next: NextFunction) {
    const { email } = request.body;

    const data = { email };

    const schema = yup.object().shape({
      email: yup.string().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .email("O campo e-mail precisa ser um e-mail válido!")
        .max(80, "No máximo 80 caracteres!")
        .required("O campo email é obrigatório!")
    });
  
    await schema.validate(data, {
      abortEarly: false
    });

    next();
  },

  async esqueciMinhaSenha(request: Request, response: Response, next: NextFunction) {
    const { email } = request.body;

    const data = { email };

    const schema = yup.object().shape({
      email: yup.string().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .email("O campo e-mail precisa ser um e-mail válido!")
        .max(80, "No máximo 80 caracteres!")
        .required("O campo email é obrigatório!")
    });
  
    await schema.validate(data, {
      abortEarly: false
    });

    next();
  },

  async atualizarSenha(request: Request, response: Response, next: NextFunction) {
    const { email, senha } = request.body;

  const data = { email, senha };

   const schema = yup.object().shape({
     email: yup.string().strict(true)
       .trim("Não são permitidos espaços no começo ou no fim!")
       .email("O campo e-mail precisa ser um e-mail válido!")
       .max(80, "No máximo 80 caracteres!")
       .required("O campo email é obrigatório!"),
     senha: yup.string().strict(true)
       .trim("Não são permitidos espaços no começo ou no fim!")
       .min(8, "No mínimo 8 caracteres!")
       .max(50, "No máximo 50 caracteres!")
       .required("O campo senha é obrigatório!"),
      token: yup.string().strict(true)
       .trim("Não são permitidos espaços no começo ou no fim!")
       .min(20, "No mínimo 20 caracteres!")
       .max(20, "No máximo 20 caracteres!")
       .required("O campo token é obrigatório!"),
   });
 
   await schema.validate(data, {
     abortEarly: false
   });

   next();
  },
  // CLIENTE
  async cadastrarCliente(request: Request, response: Response, next: NextFunction) {
    const { 
      nome, 
      cpf, 
      telefone, 
      celular, 
      sexo_id, 
      cidade_id, 
      bairro, 
      logradouro, 
      numero, 
      complemento, 
      cep,
      email,
      senha
     } = request.body;

     const data = { 
      nome, 
      cpf, 
      telefone, 
      celular, 
      sexo_id, 
      cidade_id, 
      bairro, 
      logradouro, 
      numero, 
      complemento, 
      cep,
      email,
      senha
     };

    const schema = yup.object().shape({
      nome: yup.string().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .matches(/^([a-zA-Zà-úÀ-Ú]|\s+)+$/, "O campo nome completo só aceita letras!")
        .min(5, "No mínimo 5 caracteres!")
        .max(90, "No máximo 90 caracteres!")
        .required("O campo nome é obrigatório!"),

      cpf: yup.string().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .min(11, "No mínimo 11 caracteres!")
        .max(11, "No máximo 11 caracteres!")
        .required("O campo CPF é obrigatório!"),

      telefone: yup.string().optional().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .min(10, "No mínimo 10 caracteres!")
        .max(10, "No máximo 10 caracteres!"),

      celular: yup.string().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .min(11, "No mínimo 11 caracteres!")
        .max(11, "No máximo 11 caracteres!")
        .required("O campo número de celular é obrigatório!"),

      sexo_id: yup.array().min(1, "O campo sexo é obrigatório!"),

      cidade_id: yup.array().min(1, "O campo cidade é obrigatório!"),

      bairro: yup.string().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .matches(/^([a-zA-Zà-úÀ-Ú]|\s+)+$/, "O campo bairro só aceita letras!")
        .min(3, "No mínimo 3 caracteres!")
        .max(90, "No máximo 90 caracteres!")
        .required("O campo bairro é obrigatório!"),

      logradouro: yup.string().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .matches(/^([a-zA-Zà-úÀ-Ú]|\s+)+$/, "O campo logradouro só aceita letras!")
        .min(5, "No mínimo 5 caracteres!")
        .max(90, "No máximo 90 caracteres!")
        .required("O campo logradouro é obrigatório!"),

      numero: yup.string().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .min(1, "No mínimo 1 caractere!")
        .max(6, "No máximo 6 caracteres!")
        .required("O campo número é obrigatório!"),

      complemento: yup.string().optional().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .min(3, "No mínimo 3 caracteres!")
        .max(90, "No máximo 90 caracteres!"),

      cep: yup.string().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .min(8, "No mínimo 8 caracteres!")
        .max(8, "No máximo 8 caracteres!")
        .required("O campo CEP é obrigatório!"),

      email: yup.string().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .email("O campo e-mail precisa ser um e-mail válido!")
        .max(80, "No máximo 80 caracteres!")
        .required("O campo email é obrigatório!"),

      senha: yup.string().strict(true)
        .trim("Não são permitidos espaços no começo ou no fim!")
        .min(8, "No mínimo 8 caracteres!")
        .max(50, "No máximo 50 caracteres!")
        .required("O campo senha é obrigatório!"),
    });
  
    await schema.validate(data, {
      abortEarly: false
    });

    next();
  },
  // AGENDAMENTO
  async agendarCliente(request: Request, response: Response, next: NextFunction) {
    const { data, procedimento_id, horario_id } = request.body;

    const dataRequest = { data, procedimento_id, horario_id };
     
    const schema = yup.object().shape({
      data: yup.date().required('O campo data é obrigatório.'),
      procedimento_id: yup.number().required('O campo procedimento é obrigatório.'),
      horario_id: yup.number().required('O campo horário é obrigatório.')
    });

    await schema.validate(dataRequest, {
      abortEarly: false
    });

    next();
  },

  async remarcarCliente(request: Request, response: Response, next: NextFunction) {
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

  async alterarProcedimentoDoCliente(request: Request, response: Response, next: NextFunction) {
    const { procedimento_id } = request.body;

    const data = { procedimento_id };
     
    const schema = yup.object().shape({
      procedimento_id: yup.number().required('O campo procedimento é obrigatório.'),
    });

    await schema.validate(data, {
      abortEarly: false
    });

    next();
  }
}