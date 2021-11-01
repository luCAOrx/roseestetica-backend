import { Router } from 'express';

import multer from 'multer';

import multerConfig from './config/multer';

import authMiddleware from './middlewares/authMidleware';

import HorariosController from './controllers/HorariosController';
import GenerosController from './controllers/GenerosController';
import CidadesController from './controllers/CidadesController';
import ProcedimentosController from './controllers/ProcedimentosController';

import ClienteController from './controllers/ClienteController';
import ClienteValidation from './validations/ClienteValidation';

import AgendamentoController from './controllers/AgendamentoController';
import AgendamentoValidation from './validations/AgendamentoValidation';

import AdminController from './controllers/AdminController';
import AdminValidation from './validations/AdminValidation';

const routes = Router();

const upload = multer(multerConfig);

routes.get('/horarios', HorariosController.listarHorarios);
routes.get('/generos', GenerosController.listarGeneros);
routes.get('/cidades', CidadesController.listarCidades);
routes.get('/procedimentos', ProcedimentosController.listarProcedimentos);

// ROTAS PARA CLIENTE
routes.post('/login',
  ClienteController.autenticar
);

routes.post('/refresh_token',
  ClienteController.refreshToken
);

routes.post('/cadastro', 
  upload.single('foto'),
  ClienteValidation.cadastrar,
  ClienteController.cadastrar,
);

routes.put('/atualizar_dados_pessoais/:id',
  authMiddleware,
  ClienteValidation.atualizarDadosPessoais,
  ClienteController.atualizarDadosPessoais
);

routes.put('/atualizar_endereco/:id',
  authMiddleware,
  ClienteValidation.atualizarEndereço,
  ClienteController.atualizarEndereço
);

routes.put('/atualizar_login/:id',
  authMiddleware,
  ClienteValidation.atualizarLogin,
  ClienteController.atualizarLogin
);

routes.patch('/atualizar_foto/:id',
  authMiddleware,
  upload.single('foto'),
  ClienteController.atualizarFoto
);

routes.post('/esqueci_minha_senha/',
  ClienteValidation.esqueciMinhaSenha,
  ClienteController.esqueciMinhaSenha
);

routes.put('/atualizar_senha/',
  ClienteValidation.atualizarSenha,
  ClienteController.atualizarSenha
);

routes.delete('/deletar/:id',
  authMiddleware,
  ClienteController.deletar
);

// AGENDAMENTOS PARA O CLIENTE
routes.get('/agendamentos_disponiveis',
  authMiddleware,
  AgendamentoController.listarHorariosDisponiveis
);

routes.get('/meus_agendamentos/:cliente_id',
  authMiddleware,
  AgendamentoController.listarAgendamentosDoCliente
);

routes.get('/detalhes_do_agendamento/:id/:agendamento_id',
  authMiddleware,
  AgendamentoController.detalhesDoAgendamento
);

routes.post('/agendar/:id',
  authMiddleware,
  AgendamentoValidation.agendar,
  AgendamentoController.agendar
);

routes.put('/remarcar/:id/:cliente_id',
  authMiddleware,
  AgendamentoValidation.remarcar,
  AgendamentoController.remarcar
);

routes.put('/alterar_procedimento/:agendamento_id',
  authMiddleware,
  AgendamentoValidation.alterarProcedimento,
  AgendamentoController.alterarProcedimento
);

routes.delete('/cancelar/:id',
  authMiddleware,
  AgendamentoController.cancelar
);

// ROTAS PARA ADMIN
routes.post('/admin_login',
  AdminController.autenticacao
);

routes.post('/admin_cadastro',
  AdminValidation.cadastrar,
  AdminController.cadastrar
);

routes.put('/admin_atualizar_login/:id',
  authMiddleware,
  AdminValidation.atualizarDadosDeLogin,
  AdminController.atualizarDadosDeLogin
);

routes.post('/admin_esqueci_minha_senha',
  AdminValidation.esqueciMinhaSenha,
  AdminController.esqueciMinhaSenha
);

routes.put('/admin_atualizar_senha',
  AdminValidation.atualizarSenha,
  AdminController.atualizarSenha
);

routes.get('/admin_agendamentos_do_dia',
  authMiddleware,
  AdminController.listarAgendamentoDoDia
);

routes.get('/admin_listar_todos_clientes',
  authMiddleware,
  AdminController.listarTodosClientes
);

routes.get('/admin_buscar_clientes',
  authMiddleware,
  AdminController.buscarClientes
);

routes.get('/admin_listar_agendamentos',
  authMiddleware,
  AdminController.listarAgendamentos
);

routes.get('/admin_buscar_agendamentos',
  authMiddleware,
  AdminController.buscarAgendamentos
);
// CLIENTE
routes.post('/admin_cadastro_cliente',
  AdminValidation.cadastrarCliente,
  AdminController.cadastrarCliente
);

routes.delete('/admin_deletar_cliente/:id',
  authMiddleware,
  AdminController.deletarCliente
);
// AGENDAMENTOS
routes.post('/admin_agendar/:id',
  authMiddleware,
  AdminValidation.agendarCliente,
  AdminController.agendarCliente
);

routes.put('/admin_remarcar/:id/:cliente_id',
  authMiddleware,
  AdminValidation.remarcarCliente,
  AdminController.remarcarCliente
);

routes.put('/admin_alterar_procedimento/:id/:cliente_id',
  authMiddleware,
  AdminValidation.alterarProcedimentoDoCliente,
  AdminController.alterarProcedimentoDoCliente
);

routes.get('/admin_agendamentos_disponiveis',
  authMiddleware,
  AdminController.listarHorariosDisponiveis
);

routes.delete('/admin_cancelar/:id',
  authMiddleware,
  AdminController.cancelarAgendamentoDoCliente
);

export default routes;