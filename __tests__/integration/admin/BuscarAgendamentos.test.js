const request = require('supertest');
const app = require('../../../src/app');
const connection = require('../../../src/database/connection');
const jwt = require('jsonwebtoken');
const authConfig = require('../../../src/config/auth.json');

function gerarToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400
  });
}

describe('O admin', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de buscar agendamentos pelo nome, 5 por pagina', async () => {
    const response = await request(app).get('/admin_buscar_agendamentos?page=1&nome=ma')
      .set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar agendamentos pela data, 5 por pagina', async () => {
    const response = await request(app).get('/admin_buscar_agendamentos?page=1&data=20200725')
      .set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar agendamentos pelo horario, 5 por pagina', async () => {
    const response = await request(app).get('/admin_buscar_agendamentos?page=1&horario=08:00')
      .set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar agendamentos pelo procedimento, 5 por pagina', async () => {
    const response = await request(app).get('/admin_buscar_agendamentos?page=1&procedimento=tra')
      .set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar agendamentos pelo preço, 5 por pagina', async () => {
    const response = await request(app).get('/admin_buscar_agendamentos?page=1&preco=35')
      .set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar agendamentos pela situacao, 5 por pagina', async () => {
    const response = await request(app).get('/admin_buscar_agendamentos?page=1&situacao=ocu')
      .set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });
});