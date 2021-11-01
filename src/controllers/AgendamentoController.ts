import { Request, Response } from 'express';

import connection from '../database/connection';

import dayjs from 'dayjs';

import 'dayjs/locale/pt-br';

export default {
  async listarHorariosDisponiveis(request: Request, response: Response) {
    try {
      const { data } = request.query;

      const horariosDisponiveis = await connection('agendamentos')
      .from('horarios')
      .where({ data })
      .join('agendamentos', 'horarios.id', 'agendamentos.horario_id')
      .select(
        'agendamentos.id',
        'data',
        'horario',
        'situacao'
      );

      return response.json(horariosDisponiveis);

    } catch (erro) {
      return response.status(400).json({ erro: 'Erro ao listar agendamentos disponíveis.' });
    }
  },

  async listarAgendamentosDoCliente(request: Request, response: Response) {
    try {
      const { page = 1 } = request.query;

      const { cliente_id } = request.params
      
      const agendamento = await connection('agendamentos')
      .where({ cliente_id })
        .join('horarios', 'horarios.id', '=', 'agendamentos.horario_id')
        .select(
          'agendamentos.id',
          'agendamentos.data',
          'horarios.horario'
        )
        .orderBy('id', 'desc')
        .limit(5)
        .offset((Number(page) - 1) * 5);
      
      const countObjeto = connection('agendamentos').count();
      
      const [count] = await countObjeto;
      
      response.header('X-Total-Count', String(count['count(*)']));

      return response.json(agendamento);

    } catch (erro) {
      return response.status(400).json({ erro: 'Falha ao listar agendamento!' });
    }
  },

  async detalhesDoAgendamento(request: Request, response: Response) {
    try {
      const {id, agendamento_id} = request.params;

      const agendamento = await connection('agendamentos')
      .where('agendamentos.id', agendamento_id)
      .andWhere('agendamentos.cliente_id', id)
      .join(
        'horarios', 
        'horarios.id', 
        '=', 
        'agendamentos.horario_id'
      )
      .select(
        'agendamentos.id',
        'agendamentos.data',
        'horarios.horario',
        'agendamentos.agendado_em',
        'agendamentos.remarcado_em'
      );

      const procedimentos = await connection('agendamentos_procedimentos')
      .where({agendamento_id})
      .andWhere('agendamentos.cliente_id', id)
      .join(
        'agendamentos',
        'agendamentos.id',
        '=',
        'agendamentos_procedimentos.agendamento_id'
      )
      .join(
        'procedimentos',
        'procedimentos.id',
        '=',
        'agendamentos_procedimentos.procedimento_id'
      )
      .select(
        'agendamentos_procedimentos.id',
        'procedimentos.procedimento',
        'procedimentos.preco',
        'agendamentos_procedimentos.procedimento_alterado_em',
      );

      return response.status(200).json({agendamento, procedimentos});
    } catch (error) {
      console.log(error);
      
      return response.status(400).json({erro: "Erro ao listar detalhes do agendamento."})
    };
  },

  async agendar(request: Request, response: Response) {
    try {
      const { data, procedimento_id, horario_id} = request.body;

      const { id } = request.params;

      const ocupado = 'ocupado';

      const transaction = await connection.transaction();
      
      const horarioIndisponivel = await transaction('agendamentos')
      .where({ horario_id, data })
      .select('horario_id')
      .first()

      const dataDeAgora = dayjs().format('YYYY/MM/DD');

      if (horarioIndisponivel) {
        return response.status(400).json({ 
          mensagem: 'Horário indisponível,agende para outro dia/horário.' 
        });
      };

      const dataEhoraDeAgora = new Date();

      const agendamento = {
        data, 
        situacao: ocupado, 
        cliente_id: id, 
        horario_id,
        agendado_em: dataEhoraDeAgora,
      }

      if (dayjs(data).isBefore(dataDeAgora)) {
        return response.status(400).json({
          mensagem: 'O dia para agendar para este dia já passou.'
        });
      } else {
        const idInserido = await transaction('agendamentos')
        .where('id', id)
        .insert(agendamento);
  
        const agendamento_id = idInserido[0];
  
        const agendamentosProcedimentos = procedimento_id.map((procedimento_id: number) => {
          return {
            agendamento_id,
            procedimento_id
          }
        });
  
        await transaction('agendamentos_procedimentos').insert(agendamentosProcedimentos);
  
        await transaction.commit();
  
        return response.status(201).json({ mensagem: 'Atendimento agendado com sucesso!' });
      };
    } catch (erro) {
      console.log(erro)
      return response.status(400).json({ erro: 'Falha ao agendar!' });
    }
  },

  async remarcar(request: Request, response: Response) {
    try {
      const dataEhoraDeAgora = new Date();
  
      const { data, horario_id} = request.body;

      const { id, cliente_id } = request.params;

      const horarioIndisponivel = await connection('agendamentos')
      .where({ horario_id, data })
      .select('horario_id')
      .first()

      const dataDeAgora = dayjs().format('YYYY/MM/DD');

      if(horarioIndisponivel) {          
        return response.status(400).json({ 
          mensagem: 'Horário indisponível, agende para outro dia/horário.' 
        });
      };

      if (dayjs(data).isBefore(dataDeAgora)) {
        return response.status(400).json({
          mensagem: 'O dia para remarcar já passou.'
        });
      } else {
        await connection('agendamentos')
        .update({
          data, 
          horario_id, 
          remarcado_em: dataEhoraDeAgora
        })
        .where('id', id)
        .andWhere('cliente_id', cliente_id);
  
        return response.status(201).json({ mensagem: 'Atendimento remarcado com sucesso.' });
      };
    } catch (erro) {
      return response.status(400).json({ mensagem: 'Falha ao remarcar agendamento.' });
    }
  },

  async alterarProcedimento(request: Request, response: Response) {
    try {
      const { procedimento_id } = request.body;

      const { agendamento_id } = request.params;

      const procedimentos = procedimento_id.map((procedimento_id: number) => {
        return {
          agendamento_id,
          procedimento_id
        }
      });

      const transaction = await connection.transaction();

      const dataEhoraDeAgora = new Date();

      const dataDoAgendamentoNoBancoDeDados = await connection('agendamentos')
      .where({ id: agendamento_id })
      .select('data')
      .first();

      const dataDeAgoraFormatada = dayjs().format('YYYY/MM/DD');

      const dataDoAgendamento = dayjs(dataDoAgendamentoNoBancoDeDados.data).format('YYYY/MM/DD');

      if (dayjs(dataDoAgendamento).isBefore(dataDeAgoraFormatada)) {
        return response.status(400).json({
          mensagem: 'Não pode remarcar para um dia anterior do atual.'
        });
      } else {
        await transaction('agendamentos_procedimentos')
        .where({ agendamento_id })
        .delete();

        await transaction('agendamentos_procedimentos').insert(procedimentos);

        await transaction('agendamentos_procedimentos')
        .update({
          procedimento_alterado_em: dataEhoraDeAgora
        })
        .where({ agendamento_id });
  
        transaction.commit();
        
        return response.status(201).json(procedimentos);
      };
    } catch (erro) {
      console.log(erro)
      return response.status(400).json({ mensagem: 'Falha em alterar o procedimento.' });
    }
  },

  async cancelar(request: Request, response: Response) { 
    try {
      const { id } = request.params;

      const dataDoAgendamentoNoBancoDeDados = await connection('agendamentos')
      .where({ id })
      .select('data')
      .first();

      const dataDeAgora = dayjs().format('YYYY/MM/DD');

      const dataDoAgendamento = dayjs(dataDoAgendamentoNoBancoDeDados.data).format('YYYY/MM/DD');

      if (dayjs(dataDoAgendamento).isBefore(dayjs(dataDeAgora))) {
        return response.status(400).json({
          mensagem: 'O dia para cancelar já passou.'
        });
      } else {
        await connection('agendamentos').where({ id }).del();
        
        return response.status(204).json();
      };

    } catch (erro) {
      return response.status(400).json({ mensagem: 'Falha ao cancelar agendamento.' });
    }
  }
}