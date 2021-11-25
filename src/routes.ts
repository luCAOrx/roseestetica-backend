import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';
import AdminController from './controllers/AdminController';
import AgendamentoController from './controllers/AgendamentoController';
import CidadesController from './controllers/CidadesController';
import ClienteController from './controllers/ClienteController';
import GenerosController from './controllers/GenerosController';
import HorariosController from './controllers/HorariosController';
import ProcedimentosController from './controllers/ProcedimentosController';
import AdminValidation from './validations/AdminValidation';
import AgendamentoValidation from './validations/AgendamentoValidation';
import ClienteValidation from './validations/ClienteValidation';

const routes = Router();

const upload = multer(multerConfig);

routes.get('/horarios', HorariosController.listarHorarios);
routes.get('/generos', GenerosController.listarGeneros);
routes.get('/cidades', CidadesController.listarCidades);
routes.get('/procedimentos', ProcedimentosController.listarProcedimentos);

// ROTAS PARA CLIENTE
routes.post('/login',
  ClienteController.autenticar);

routes.post('/refresh_token',
  ClienteController.refreshToken);

routes.post('/cadastro',
  upload.single('foto'),
  ClienteValidation.cadastrar,
  ClienteController.cadastrar);

routes.put('/atualizar_dados_pessoais/:id',
  ClienteValidation.atualizarDadosPessoais,
  ClienteController.atualizarDadosPessoais);

routes.put('/atualizar_endereco/:id',
  ClienteValidation.atualizarEndereço,
  ClienteController.atualizarEndereço);

routes.put('/atualizar_login/:id',
  ClienteValidation.atualizarLogin,
  ClienteController.atualizarLogin);

routes.patch('/atualizar_foto/:id',
  upload.single('foto'),
  ClienteController.atualizarFoto);

routes.post('/esqueci_minha_senha/',
  ClienteValidation.esqueciMinhaSenha,
  ClienteController.esqueciMinhaSenha);

routes.put('/atualizar_senha/',
  ClienteValidation.atualizarSenha,
  ClienteController.atualizarSenha);

routes.delete('/deletar/:id',
  ClienteController.deletar);

// AGENDAMENTOS PARA O CLIENTE
routes.get('/agendamentos_disponiveis',
  AgendamentoController.listarHorariosDisponiveis);

routes.get('/meus_agendamentos/:cliente_id',
  AgendamentoController.listarAgendamentosDoCliente);

routes.get('/detalhes_do_agendamento/:id/:agendamento_id',
  AgendamentoController.detalhesDoAgendamento);

routes.post('/agendar/:id',
  AgendamentoValidation.agendar,
  AgendamentoController.agendar);

routes.put('/remarcar/:id/:cliente_id',
  AgendamentoValidation.remarcar,
  AgendamentoController.remarcar);

routes.put('/alterar_procedimento/:agendamento_id',
  AgendamentoValidation.alterarProcedimento,
  AgendamentoController.alterarProcedimento);

routes.delete('/cancelar/:id',
  AgendamentoController.cancelar);

// ROTAS PARA ADMIN
routes.post('/admin_login',
  AdminController.autenticacao);

routes.post('/admin_cadastro',
  AdminValidation.cadastrar,
  AdminController.cadastrar);

routes.put('/admin_atualizar_login/:id',
  AdminValidation.atualizarDadosDeLogin,
  AdminController.atualizarDadosDeLogin);

routes.post('/admin_esqueci_minha_senha',
  AdminValidation.esqueciMinhaSenha,
  AdminController.esqueciMinhaSenha);

routes.put('/admin_atualizar_senha',
  AdminValidation.atualizarSenha,
  AdminController.atualizarSenha);

routes.get('/admin_agendamentos_do_dia',
  AdminController.listarAgendamentoDoDia);

routes.get('/admin_listar_todos_clientes',
  AdminController.listarTodosClientes);

routes.get('/admin_buscar_clientes',
  AdminController.buscarClientes);

routes.get('/admin_listar_agendamentos',
  AdminController.listarAgendamentos);

routes.get('/admin_buscar_agendamentos',
  AdminController.buscarAgendamentos);
// CLIENTE
routes.post('/admin_cadastro_cliente',
  AdminValidation.cadastrarCliente,
  AdminController.cadastrarCliente);

routes.delete('/admin_deletar_cliente/:id',
  AdminController.deletarCliente);
// AGENDAMENTOS
routes.post('/admin_agendar/:id',
  AdminValidation.agendarCliente,
  AdminController.agendarCliente);

routes.put('/admin_remarcar/:id/:cliente_id',
  AdminValidation.remarcarCliente,
  AdminController.remarcarCliente);

routes.put('/admin_alterar_procedimento/:id/:cliente_id',
  AdminValidation.alterarProcedimentoDoCliente,
  AdminController.alterarProcedimentoDoCliente);

routes.get('/admin_agendamentos_disponiveis',
  AdminController.listarHorariosDisponiveis);

routes.delete('/admin_cancelar/:id',
  AdminController.cancelarAgendamentoDoCliente);

export default routes;
