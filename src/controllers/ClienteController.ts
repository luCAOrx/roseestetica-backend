import { Request, Response } from 'express';

import fileSystem from 'fs';

import path from 'path';

import connection from '../database/connection';

import bcrypt, { compare, hashSync } from 'bcryptjs';

import { randomBytes } from 'crypto';

import mailer from '../modules/mailer';

import GenerateTokenProvider from '../providers/GenerateTokenProvider';
import GenerateRefreshTokenProvider from '../providers/GenerateRefreshTokenProvider';

import dayjs from 'dayjs';

import aws from 'aws-sdk';

import { promisify } from 'util';

const s3 = new aws.S3();

export default {
  async autenticar(request: Request, response: Response) {
    try {
      const { email, senha } = request.body;
  
      const cliente = await connection('clientes').where({ email }).select('*').first();
  
      if (!cliente) {
        return response.status(400).json({ erro: 'E-mail ou senha inválido.' });
      };

      const senhaSalvaNoBancoDeDados = await compare(senha, cliente.senha);
  
      if (!senhaSalvaNoBancoDeDados) {
        return response.status(400).json({ erro: 'E-mail ou senha inválido.' });
      };

      const clientes = await connection('clientes')
      .join('sexos', 'sexos.id', '=', 'clientes.sexo_id')
      .join('cidades', 'cidades.id', '=', 'clientes.cidade_id')
      .where({ email })
      .select([
        'clientes.id',
        'clientes.nome',
        'clientes.cpf',
        'clientes.sexo_id',
        'sexos.sexo',
        'clientes.telefone',
        'clientes.celular',
        'clientes.cidade_id',
        'cidades.cidade',
        'clientes.bairro',
        'clientes.logradouro',
        'clientes.numero',
        'clientes.complemento',
        'clientes.cep',
        'clientes.email',
      ])
      .first();

      const imagens = await connection('imagens')
      .where('cliente_id', cliente.id)
      .select(['imagem', 'imagem_aws_url'])
      .first();

      const dados = {
        clientes,
        imagens
      };

      const clienteSerializado = {
        ...dados,
        imagem_local_url: `${process.env.APP_URL}/uploads/${imagens.imagem}`,
      };
      
      cliente.senha = undefined;
      cliente.token_reset_senha = undefined;
      cliente.expiracao_reset_senha = undefined;
      cliente.criado_em = undefined;
      cliente.atualizado_em = undefined;
  
      const token = await GenerateTokenProvider.generateToken({ id: cliente.id });

      await connection('refresh_token').where({cliente_id: cliente.id}).del();

      const refreshToken = await GenerateRefreshTokenProvider.generateRefreshToken(cliente.id);
  
      return response.json({
        cliente: clienteSerializado.clientes,
        imagem_url: 
          process.env.STORAGE_TYPE === 'local' ? 
          clienteSerializado.imagem_local_url : 
          clienteSerializado.imagens.imagem_aws_url,
        token,
        refreshToken
      });
  
    } catch (erro) {
      return response.status(400).json({ erro: 'Erro em se autenticar.' });
    }
  },

  async refreshToken(request: Request, response: Response) {
    try {
      const { refresh_token } = request.body;
  
      const refreshToken = await connection('refresh_token')
      .where({id: refresh_token})
      .select('*')
      .first();
  
      if (!refreshToken) {
        return response.status(400).json({ erro: 'Refresh token inválido.' });
      };

      const refreshTokenExpirou = dayjs().isAfter(
        dayjs.unix(refreshToken.espira_em)
      );
  
      const token = await GenerateTokenProvider.generateToken({id: refreshToken.cliente_id});

      if (refreshTokenExpirou) {
        await connection('refresh_token')
        .where({cliente_id: refreshToken.cliente_id})
        .del();

        const novoRefreshToken = await GenerateRefreshTokenProvider.generateRefreshToken(
          refreshToken.cliente_id
        );

        return response.json({token, refreshToken: novoRefreshToken});
      }
  
      return response.json({token});
    } catch (error) {
      return response.status(400).json({ erro: "Erro ao gerar o refresh token." })
    }
  },

  async cadastrar(request: Request, response: Response) {
    try {
      const senha = await bcrypt.hash(request.body.senha, 8);
  
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
        cidade_id
      } = request.body;

      const { key: imagem, location: imagem_aws_url = '' } = request.file as Express.MulterS3.File;

      const dataEhoraDeAgora = new Date();

      const cpfExiste = await connection('clientes')
      .where({ cpf }).select('cpf').first();

      const emailExiste = await connection('clientes')
      .where({ email }).select('email').first();

      if (!imagem) {
        return response.status(400).json({ erro: 'O campo imagem é obrigatório.' });
      };

      if (cpfExiste) {
        process.env.STORAGE_TYPE === 'local' ?

        promisify(fileSystem.unlink)(path.resolve(
          __dirname, '..', '..', `uploads/${imagem}`
        )) :

        s3.deleteObject({
          Bucket: 'roseestetica-upload',
          Key: imagem
        }).promise();

        return response.status(400).json({ erro: 'Esse cpf já existe.' });
      };
  
      if (emailExiste) {
        process.env.STORAGE_TYPE === 'local' ?

        promisify(fileSystem.unlink)(path.resolve(
          __dirname, '..', '..', `uploads/${imagem}`
        )) :

        s3.deleteObject({
          Bucket: 'roseestetica-upload',
          Key: imagem
        }).promise();
        
        return response.status(400).json({ erro: 'Esse e-mail já existe.' });
      };

      const transaction = await connection.transaction();
  
      const idInserido = await transaction('clientes').insert({
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
        criado_em: dataEhoraDeAgora
      });

      const id = idInserido[0];

      await transaction('imagens').insert({
        imagem,
        imagem_aws_url,
        cliente_id: id,
        criado_em: dataEhoraDeAgora
      });

      await transaction.commit();

      const dados = {
        cliente: {
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
          cidade_id
        },
        imagem_aws_url,
      };

      const clienteSerializado = {
        ...dados,
        imagem_local_url: `${process.env.APP_URL}/uploads/${imagem}`,
      };
  
      return response.status(201).json({
        cliente: clienteSerializado.cliente,
        imagem_url: process.env.STORAGE_TYPE === 'local' ? 
        clienteSerializado.imagem_local_url : 
        clienteSerializado.imagem_aws_url,
      });
    } catch (erro) {      
      const { key: imagem } = request.file as Express.MulterS3.File;

      process.env.STORAGE_TYPE === 'local' ?

      promisify(fileSystem.unlink)(path.resolve(
        __dirname, '..', '..', `uploads/${imagem}`
      )) :

      s3.deleteObject({
        Bucket: 'roseestetica-upload',
        Key: imagem
      }).promise();
      
      return response.status(400).json({ erro: 'Falha ao se cadastrar.' })
    }
  },

  async atualizarDadosPessoais(request: Request, response: Response) {
    try {
      const { id } = request.params;
  
      const dataEhoraDeAgora = new Date();
  
      const {
        nome,
        telefone,
        celular
      } = request.body;
  
      await connection('clientes')
      .update({
        nome,
        telefone,
        celular,
        atualizado_em: dataEhoraDeAgora
      })
      .where({ id });

      const clientes = await connection('clientes')
      .join('sexos', 'sexos.id', '=', 'clientes.sexo_id')
      .join('cidades', 'cidades.id', '=', 'clientes.cidade_id')
      .where('clientes.id', id)
      .select([
        'clientes.id',
        'clientes.nome',
        'clientes.cpf',
        'clientes.sexo_id',
        'sexos.sexo',
        'clientes.telefone',
        'clientes.celular',
        'clientes.cidade_id',
        'cidades.cidade',
        'clientes.bairro',
        'clientes.logradouro',
        'clientes.numero',
        'clientes.complemento',
        'clientes.cep',
        'clientes.email',
      ])
      .first();

      const imagens = await connection('imagens')
      .where('cliente_id', id)
      .select(['imagem', 'imagem_aws_url'])
      .first();

      const dados = {
        clientes,
        imagens
      };

      const clienteSerializado = {
        ...dados,
        imagem_local_url: `${process.env.APP_URL}/uploads/${imagens.imagem}`,
      };
  
      return response.status(201).json({ 
        cliente: clienteSerializado.clientes,
        imagem_url: process.env.STORAGE_TYPE === 'local' ? 
        clienteSerializado.imagem_local_url : 
        clienteSerializado.imagens.imagem_aws_url,
      });
  
    } catch (erro) {
      return response.status(400).json({ erro: 'Erro ao atualizar dados pessoais.' });
    }
  },

  async atualizarEndereço(request: Request, response: Response) {
    try {
      const { id } = request.params;
  
      const dataEhoraDeAgora = new Date();
  
      const {
        cidade_id,
        bairro,
        logradouro,
        numero,
        complemento,
        cep
      } = request.body;
  
      await connection('clientes')
      .update({
        cidade_id,
        bairro,
        logradouro,
        numero,
        complemento,
        cep,
        atualizado_em: dataEhoraDeAgora
      })
      .where({ id });

      const clientes = await connection('clientes')
      .join('sexos', 'sexos.id', '=', 'clientes.sexo_id')
      .join('cidades', 'cidades.id', '=', 'clientes.cidade_id')
      .where('clientes.id', id)
      .select([
        'clientes.id',
        'clientes.nome',
        'clientes.cpf',
        'clientes.sexo_id',
        'sexos.sexo',
        'clientes.telefone',
        'clientes.celular',
        'clientes.cidade_id',
        'cidades.cidade',
        'clientes.bairro',
        'clientes.logradouro',
        'clientes.numero',
        'clientes.complemento',
        'clientes.cep',
        'clientes.email',
      ])
      .first();

      const imagens = await connection('imagens')
      .where('cliente_id', id)
      .select(['imagem', 'imagem_aws_url'])
      .first();

      const dados = {
        clientes,
        imagens
      };

      const clienteSerializado = {
        ...dados,
        imagem_local_url: `${process.env.APP_URL}/uploads/${imagens.imagem}`,
      };
  
      return response.status(201).json({ 
        cliente: clienteSerializado.clientes,
        imagem_url: process.env.STORAGE_TYPE === 'local' ? 
        clienteSerializado.imagem_local_url : 
        clienteSerializado.imagens.imagem_aws_url,
      });
  
    } catch (erro) {
      return response.status(400).json({ erro: 'Erro ao atualizar dados pessoais.' });
    }
  },

  async atualizarLogin(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const { email } = request.body;
  
      const dataEhoraDeAgora = new Date();

      const emailExiste = await connection('clientes')
      .where({ email })
      .select('email')
      .first();
  
      if (emailExiste) {
        return response.status(400).json({ erro: 'Esse e-mail já existe.' });
      };
  
      await connection('clientes')
      .update({ 
        email, 
        atualizado_em: dataEhoraDeAgora 
      })
      .where({ id });
  
      const clientes = await connection('clientes')
      .join('sexos', 'sexos.id', '=', 'clientes.sexo_id')
      .join('cidades', 'cidades.id', '=', 'clientes.cidade_id')
      .where('clientes.id', id)
      .select([
        'clientes.id',
        'clientes.nome',
        'clientes.cpf',
        'clientes.sexo_id',
        'sexos.sexo',
        'clientes.telefone',
        'clientes.celular',
        'clientes.cidade_id',
        'cidades.cidade',
        'clientes.bairro',
        'clientes.logradouro',
        'clientes.numero',
        'clientes.complemento',
        'clientes.cep',
        'clientes.email',
      ])
      .first();

      const imagens = await connection('imagens')
      .where('cliente_id', id)
      .select(['imagem', 'imagem_aws_url'])
      .first();

      const dados = {
        clientes,
        imagens
      };

      const clienteSerializado = {
        ...dados,
        imagem_local_url: `${process.env.APP_URL}/uploads/${imagens.imagem}`,
      };
  
      return response.status(201).json({ 
        cliente: clienteSerializado.clientes,
        imagem_url: process.env.STORAGE_TYPE === 'local' ? 
        clienteSerializado.imagem_local_url : 
        clienteSerializado.imagens.imagem_aws_url,
      });
  
    } catch (erro) {
      return response.status(400).json({ erro: 'Erro ao atualizar login.' });
    }
  },

  async atualizarFoto(request: Request, response: Response) {
    try {
      const { id } = request.params;

      const { key: imagem, location: imagem_aws_url = '' } = request.file as Express.MulterS3.File;
  
      const dataEhoraDeAgora = new Date();

      const imagens = await connection('imagens')
      .where('cliente_id', id)
      .select(['imagem', 'imagem_aws_url'])
      .first();

      if (process.env.STORAGE_TYPE === 'local') {
        promisify(fileSystem.unlink)(path.resolve(
          __dirname, '..', '..', `uploads/${imagens.imagem}`
        ));
      } else {
        s3.deleteObject({
          Bucket: 'roseestetica-upload',
          Key: imagens.imagem
        }).promise();
      };

      await connection('imagens')
      .update({ 
        imagem,
        imagem_aws_url,
        atualizado_em: dataEhoraDeAgora 
      })
      .where('cliente_id', id);
  
      const imagemAtualizada = await connection('imagens')
      .where('cliente_id', id)
      .select(['imagem', 'imagem_aws_url'])
      .first();

      const clienteSerializado = {
        imagemAtualizada,
        imagem_local_url: `${process.env.APP_URL}/uploads/${imagemAtualizada.imagem}`,
      };
  
      return response.status(201).json({ 
        imagem_url: process.env.STORAGE_TYPE === 'local' ? 
        clienteSerializado.imagem_local_url : 
        clienteSerializado.imagemAtualizada.imagem_aws_url,
      });
    } catch (error) {
      const { key: imagem } = request.file as Express.MulterS3.File;

      if (process.env.STORAGE_TYPE === 'local') {
        promisify(fileSystem.unlink)(path.resolve(
          __dirname, '..', '..', `uploads/${imagem}`
        ));
      } else {
        s3.deleteObject({
          Bucket: 'roseestetica-upload',
          Key: imagem
        }).promise();
      };
      
      return response.status(400).json({ erro: 'Erro ao atualizar a foto.' });
    }
  },

  async esqueciMinhaSenha(request: Request, response: Response) {
    try {
      const { email } = request.body;
      
      const cliente = await connection('clientes')
      .where({ email }).select('email').first();
  
      if (!cliente) {
        return response.status(400).json({ erro: 'E-mail inválido.' });
      }
  
      const token = randomBytes(5).toString('hex');
  
      const expiracaoResetSenha = new Date();

      expiracaoResetSenha.setHours(expiracaoResetSenha.getHours() + 1);
  
      await connection('clientes')
        .update({
          token_reset_senha: token,
          expiracao_reset_senha: expiracaoResetSenha
        }).where({ email });

      const mail = {
        subject: `Recuperar senha, seu código é: ${token}`,
        from: '"Rose estética" <lucaorxrx@gmail.com>',
        to: email,
        template: 'esqueci_minha_senha',
        context: { token }
      }
  
      mailer.sendMail(mail, async (erro) => {
        if(erro)
          return response.status(400).json({ 
            mailerError: 'Não foi possível enviar o email para recuperação de senha.' 
          });

        return response.status(200).json({
          mensagem: 'Um token foi enviado para o seu e-mail, vizualize sua caixa de entrada,span ou lixeira.'
        });
      });
      
    } catch (erro) {
      return response.status(400).json({ 
        erro: 'Não foi possível enviar o email para recuperação de senha.' 
      });
    }
  },

  async atualizarSenha(request: Request, response: Response) {
    
      const { email, token } = request.body;
    
      const senha = hashSync(request.body.senha, 8);

      const cliente = await connection('clientes')
        .where({ email })
        .select('token_reset_senha', 'expiracao_reset_senha')
        .first();

      if (!cliente)
        return response.status(400).json({ EmailError: 'E-mail inválido.' });
  
      if (token !== cliente.token_reset_senha)
        return response.status(400).json({ TokenError: 'Token inválido.' });
  
      const dataEhoraDeAgora = new Date();
  
      if (dataEhoraDeAgora > cliente.expiracao_reset_senha)
        return response.status(400).json({ erro: 'O token expirou, gere um novo.' });
  
      await connection('clientes').update({ 
        senha,
        atualizado_em: dataEhoraDeAgora
      }).where({ email });
  
      response.status(201).json({ mensagem: 'Sua senha foi alterada com sucesso.' });
  
  },

  async deletar(request: Request, response: Response) {
    try {
      const { id } = request.params;

      const imagem = await connection('imagens')
      .where('cliente_id', id)
      .first();

      if (process.env.STORAGE_TYPE === 'local') {
        promisify(fileSystem.unlink)(path.resolve(
          __dirname, '..', '..', `uploads/${imagem.imagem}`
        ));
      } else {
        s3.deleteObject({
          Bucket: 'roseestetica-upload',
          Key: imagem.imagem
        }).promise();
      };

      await connection('clientes').where({ id }).del();
  
      return response.status(204).json();
  
    } catch (error) {
      return response.status(400).json({ erro: 'Erro ao deletar usuário.' });
    }
  }
};