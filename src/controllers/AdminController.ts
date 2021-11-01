import { NextFunction, Request, Response } from 'express';

import connection from '../database/connection';

import crypto from 'crypto';

import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import authConfig from '../config/auth';

import mailer from '../modules/mailer';

function gerarToken(params: {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400 * 1000
  });
}

export default {
  // ADMIN
  async autenticacao(request: Request, response: Response, next: NextFunction) {
    try {
      const { email, senha } = request.body;

      const admin = await connection('admins').where({ email }).select('*').first();
  
      if(!admin) {
        return response.status(400).json({ erro: 'E-mail inválido.' });
      }
  
      if(!await bcrypt.compare(senha, admin.senha)) {
        return response.status(400).json({ erro: 'Senha inválida.' });
      }

      admin.senha = undefined;
      admin.token_reset_senha = undefined;
      admin.expiracao_reset_senha = undefined;
      admin.criado_em = undefined;
      admin.atualizado_em = undefined;

      response.json({ 
        admin, 
        token: gerarToken({ id: admin.id }),
      });

    } catch (erro) {
        next(response.status(400).json({ erro: 'Erro em se autenticar.' }));
    }
  },
  
  async cadastrar(request: Request, response: Response, next: NextFunction) {
    try {
      const senha = bcrypt.hashSync(request.body.senha, process.env.BCRYPT_SALT);
      
      const { email } = request.body;

      if(await connection('admins').where({ email }).select('email').first()) 
        return response.status(400).send({ erro: 'Esse email ja existe.' });
              
      await connection('admins').insert({ email, senha });

      
      const admin = await connection('admins')
      .where('email' ,request.body.email).select('*').first();
      
      admin.senha = undefined;
      admin.token_reset_senha = undefined;
      admin.expiracao_reset_senha = undefined;
      admin.criado_em = undefined;
      admin.atualizado_em = undefined;

      return response.status(201).json({ 
        admin, 
        token: gerarToken({ id: admin.id })
      });
      
    } catch (erro) {
      next(response.status(400).json({ erro: 'Erro ao se cadastrar.' }));
    }
  },

  async atualizarDadosDeLogin(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      const { email } = request.body;

      const dataEhoraDeAgora = new Date();
      dataEhoraDeAgora.setHours(dataEhoraDeAgora.getHours());
      dataEhoraDeAgora.setDate(dataEhoraDeAgora.getDate());

      if(await connection('admins').where({ email }).select('email').first())
        return response.status(400).json({ erro: 'Esse e-mail ja existe.' })

      await connection('admins')
      .update({ email, atualizado_em: dataEhoraDeAgora }).where('id', id);

      return response.status(201).json({ mensagem: 'Seu login foi atualizado com sucesso.' });

    } catch (erro) {
      next(response.status(400).json({ erro: 'Erro ao atualizar login.' }));
    }
  },

  async esqueciMinhaSenha(request: Request, response: Response, next: NextFunction) {
    try {
      const { email } = request.body;
      
      const admin = await connection('admins').where('email', email).select('email').first();

      if(!admin)
        return response.status(400).json({ erro: 'Email inválido.' });

      const token = crypto.randomBytes(Number(process.env.CRYPTO_HASH)).toString('hex');

      const horaDeAgora = new Date();
      horaDeAgora.setHours(horaDeAgora.getHours() + 1);

      await connection('admins')
      .update({
        token_reset_senha: token,
        expiracao_reset_senha: horaDeAgora
      }).where({ email });

      const mail = {
        to: email,
        from: 'lucaorx@protonmail.com',
        template: 'esqueci_minha_senha',
        context: { token }
      }

      mailer.sendMail(mail), (erro: any) => {
        if(erro)
        return response.status(400).json({ erro: 'Não foi possível enviar o email para recuperação de senha.' });

        return response.status(200).json({
          mensagem: 'Um token foi enviado para o seu e-mail, vizualize sua caixa de entrada,span ou lixeira.'
        });
      };

    } catch (erro) {
      next(response.status(400).json({ erro: 'Erro ao tentar recuperar senha.' }))
    }
  },

  async atualizarSenha(request: Request, response: Response, next: NextFunction) {
    try {
      const { email, token } = request.body;
  
      const senha = bcrypt.hashSync(request.body.senha, process.env.BCRYPT_SALT);

      const admin = await connection('admins')
      .where('email', email)
      .select('email', 'senha', 'token_reset_senha', 'expiracao_reset_senha')
      .first();

      if(!admin)
        return response.status(400).json({ erro: 'Email inválido.' });
      
      if(token !== admin.token_reset_senha)
        return response.status(400).json({ erro: 'Token inválido.' });

      const horaDeAgora = new Date();

      if(horaDeAgora > admin.expiracao_reset_senha)
        return response.status(400).json({ erro: 'O token expirou, gere um novo.' });

      admin.senha = senha;

      await connection('admins').update({ senha }).where({ email });

      response.status(201).json({ mensagem: 'Sua senha foi alterada com sucesso.' });

    } catch (erro) {
      next(response.status(400).json({ erro: 'Erro ao tentar atualizar sua senha.' }));
    }
  },
  // OPERAÇÕES DO ADMIN
  async listarTodosClientes(request: Request, response: Response, next: NextFunction) {
    try {
      const { page = 1 } = request.query;

      const [count] = await connection('clientes').count();

      const clientes = await connection('clientes')
      .limit(5)
      .offset((Number(page) - 1) * 5)
      .join('sexos', 'sexos.id', '=', 'clientes.sexo_id')
      .join('cidades', 'cidades.id', '=', 'clientes.cidade_id')
      .select([
        'clientes.id',
        'clientes.nome',
        'clientes.cpf',
        'sexos.sexo',
        'clientes.telefone',
        'clientes.celular',
        'cidades.cidade',
        'clientes.bairro',
        'clientes.logradouro',
        'clientes.numero',
        'clientes.complemento',
        'clientes.cep',
        'clientes.email',
        'clientes.criado_em',
        'clientes.atualizado_em',
      ]);

      response.header('X-Total-Count', String(count['count(*)']));

      return response.json(clientes);

    } catch (erro) {
        next(response.status(400).json({ erro: 'Erro em listar clientes.' }))
    }
  },

  async buscarClientes(request: Request, response: Response, next: NextFunction) {
    try {
      const { 
        page = 1,
        nome,
        cpf,
        telefone, 
        celular, 
        bairro, 
        logradouro, 
        numero, 
        complemento, 
        cep,
        email,
        sexo,
        cidade,
      } = request.query;

      const clientes = await connection('clientes')
      .limit(5)
      .offset((Number(page) - 1) * 5)
      .join('sexos', 'sexos.id', '=', 'clientes.sexo_id')
      .join('cidades', 'cidades.id', '=', 'clientes.cidade_id')
      .where('nome', 'like', `%${nome}%`)
      .orWhere('cpf', 'like', `%${cpf}%`)
      .orWhere('telefone', 'like', `%${telefone}%`)
      .orWhere('celular', 'like', `%${celular}%`)
      .orWhere('bairro', 'like', `%${bairro}%`)
      .orWhere('logradouro', 'like', `%${logradouro}%`)
      .orWhere('numero', 'like', `%${numero}%`)
      .orWhere('complemento', 'like', `%${complemento}%`)
      .orWhere('cep', 'like', `%${cep}%`)
      .orWhere('email', 'like', `%${email}%`)
      .orWhere('sexo', 'like', `%${sexo}%`)
      .orWhere('cidade', 'like', `%${cidade}%`)
      .select([
        'clientes.id',
        'clientes.nome',
        'clientes.cpf',
        'sexos.sexo',
        'clientes.telefone',
        'clientes.celular',
        'cidades.cidade',
        'clientes.bairro',
        'clientes.logradouro',
        'clientes.numero',
        'clientes.complemento',
        'clientes.cep',
        'clientes.email',
        'clientes.criado_em',
        'clientes.atualizado_em',
      ]);

      return response.json(clientes);

    } catch (erro) {
      console.log(erro)
        next(response.status(400).json({ erro: 'Erro em buscar clientes.' }))
    }
  },

  async listarAgendamentoDoDia(request: Request, response: Response, next: NextFunction) {
    try {
      const data = new Date();
      const dia = data.getDate();
      const mes = data.getMonth();
      const ano = data.getFullYear();
      const dataDoDia = new Date(ano, mes, dia);

      const agendamentoDoDia = await connection('agendamentos')
      .from('horarios')
      .leftJoin('agendamentos', 'horarios.id', 'agendamentos.horario_id')
      .join('procedimentos', 'procedimentos.id', '=', 'agendamentos.procedimento_id')
      .join('clientes', 'clientes.id', '=', 'agendamentos.cliente_id')
      .select(
        'agendamentos.id',
        'clientes.nome',
        'data',
        'horario',
        'procedimentos.procedimento',
        'procedimentos.preco',
        )
      .where('data', dataDoDia)

      return response.json(agendamentoDoDia)

    } catch (erro) {
      next(response.status(400).json({ erro: 'Erro ao listar agendamento do dia.' }))
    }
  },

  async listarAgendamentos(request: Request, response: Response, next: NextFunction) {
    try {
      const { page = 1 } = request.query;

      const [count] = await connection('clientes').count();
      
      const agendamentos = await connection('agendamentos')
      .limit(5)
      .offset((Number(page) - 1) * 5)
      .join('procedimentos', 'procedimentos.id', '=', 'agendamentos.procedimento_id')
      .join('horarios', 'horarios.id', '=', 'agendamentos.horario_id')
      .join('clientes', 'clientes.id', '=', 'agendamentos.cliente_id')
      .select([
        'agendamentos.id',
        'clientes.nome',
        'agendamentos.data',
        'horarios.horario',
        'procedimentos.procedimento',
        'procedimentos.preco',
        'agendamentos.situacao',
        'agendamentos.agendado_em',
        'agendamentos.remarcado_em'
      ]);

      response.header('X-Total-Count', String(count['count(*)']));

      return response.json(agendamentos);

    } catch (erro) {
      next(response.status(400).json({ erro: 'Falha ao listar agendamentos!' }));
    }
  },

  async buscarAgendamentos(request: Request, response: Response, next: NextFunction) {
    try {
      const { 
        page = 1, 
        nome, 
        data, 
        horario, 
        procedimento, 
        preco, 
        situacao
      } = request.query;

      const agendamentos = await connection('agendamentos')
      .limit(5)
      .offset((Number(page) - 1) * 5)
      .join('procedimentos', 'procedimentos.id', '=', 'agendamentos.procedimento_id')
      .join('horarios', 'horarios.id', '=', 'agendamentos.horario_id')
      .join('clientes', 'clientes.id', '=', 'agendamentos.cliente_id')
      .where('nome', 'like', `%${nome}%`)
      .orWhere('data', 'like', `%${data}%`)
      .orWhere('horario', 'like', `%${horario}%`)
      .orWhere('procedimento', 'like', `%${procedimento}%`)
      .orWhere('preco', 'like', `%${preco}%`)
      .orWhere('situacao', 'like', `%${situacao}%`)
      .select([
        'agendamentos.id',
        'clientes.nome',
        'agendamentos.data',
        'horarios.horario',
        'procedimentos.procedimento',
        'procedimentos.preco',
        'agendamentos.situacao',
        'agendamentos.agendado_em',
        'agendamentos.remarcado_em'
      ]);

      return response.json(agendamentos);

    } catch (erro) {
        next(response.status(400).json({ erro: 'Erro em buscar agendamento.' }))
    }
  },
  // CLIENTE
  async cadastrarCliente(request: Request, response: Response, next: NextFunction) {
    try {
      const senha = bcrypt.hashSync(request.body.senha, 10);
      
      const {
        nome,
        cpf,
        telefone, 
        celular, 
        bairro, 
        logradouro, 
        numero, 
        complemento, 
        cep,
        email,
        sexo_id,
        cidade_id,
      } = request.body;

      if(await connection('clientes').where({ cpf }).select('cpf').first())
        return response.status(400).send({ erro: 'Esse cpf ja existe.' });

      if(await connection('clientes').where({ email }).select('email').first()) 
        return response.status(400).send({ erro: 'Esse e-mail ja existe.' })
              
      await connection('clientes').insert({
        nome,
        cpf,
        telefone, 
        celular, 
        bairro, 
        logradouro, 
        numero, 
        complemento, 
        cep, 
        email, 
        senha,
        sexo_id,
        cidade_id,
      });

      return response.status(201).json({ mensagem: 'Cliente cadastrado com sucesso.' });
      
    } catch (erro) {
        next(response.status(400).json({ erro: 'Erro em cadastrar cliente.' }));
      }
  },

  async deletarCliente(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;

      await connection('clientes').where({ id }).del();

      return response.status(204).json();

    } catch (error) {
      next(response.status(400).json({ erro: 'Erro em deletar cliente.' }));
    }
  },
  // AGENDAMENTO DO CLIENTE
  async agendarCliente(request: Request, response: Response, next: NextFunction) {
    try {
      const { data, procedimento_id, horario_id} = request.body;
      const { id } = request.params;
      const ocupado = 'ocupado';

      if (await connection('agendamentos').where({ horario_id: horario_id, data: data }).select('horario_id').first())
        return response.status(400).json({ mensagem: 'Horário indisponível,agende para outro dia/horário.' })

      await connection('agendamentos')
      .where('id', id)
      .insert({
        data, situacao: ocupado, procedimento_id, cliente_id: id, horario_id
      });

      return response.status(201).json({ mensagem: 'Atendimento agendado com sucesso!' });

    } catch (erro) {
      console.log(erro)
      next(response.status(400).json({ erro: 'Erro ao agendar cliente!' }));
    }
  },

  async remarcarCliente(request: Request, response: Response, next: NextFunction) {
    try {
      const dataEhoraDeAgora = new Date();
      dataEhoraDeAgora.setHours(dataEhoraDeAgora.getHours());
      dataEhoraDeAgora.setDate(dataEhoraDeAgora.getDate());
  
      const { data, horario_id} = request.body;
      const { id, cliente_id } = request.params;

      if(await connection('agendamentos').where({ horario_id: horario_id, data: data }).select('horario_id').first())
        return response.status(400).json({ mensagem: 'Horário indisponível,agende para outro dia/horário.' });
        
        await connection('agendamentos')
        .update({
          data, horario_id, remarcado_em: dataEhoraDeAgora
        })
        .where('id', id).andWhere('cliente_id', cliente_id);

        return response.status(201).json({ mensagem: 'Atendimento remarcado com sucesso.' });

    } catch (erro) {
      next(response.status(400).json({ erro: 'Erro ao remarcar agendamento do cliente.' }));
    }
  },

  async alterarProcedimentoDoCliente(request: Request, response: Response, next: NextFunction) {
    try {
      const { procedimento_id } = request.body;
      const { id, cliente_id } = request.params;

      await connection('agendamentos')
      .update({
        procedimento_id
      })
      .where('id', id).andWhere('cliente_id', cliente_id);

      return response.status(201).json({ mensagem: 'Procedimento alterado com sucesso.' });

    } catch (erro) {
      next(response.status(400).json({ erro: 'Erro ao remarcar agendamento do cliente.' }));
    }
  },

  async listarHorariosDisponiveis(request: Request, response: Response, next: NextFunction) {    
    try {
      const { data } = request.query;

      const horariosDisponiveis = await connection('agendamentos')
      .from('horarios')
      .leftJoin('agendamentos', 'horarios.id', 'agendamentos.horario_id')
      .select(
        'agendamentos.id',
        'data',
        'horario',
        'situacao'
      )
      .where('data', String(data))

      return response.json(horariosDisponiveis)

    } catch (erro) {
      next(response.status(400).json({ erro: 'Erro ao listar agendamentos disponíveis.' }))
    }
  },

  async cancelarAgendamentoDoCliente(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;

      await connection('agendamentos').where('id', id).del();

      return response.status(204).json();

    } catch (erro) {
      next(response.status(400).json({ erro: 'Falha ao cancelar agendamento do cliente.' }));
    }
  }
}