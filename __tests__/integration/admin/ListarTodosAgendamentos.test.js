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

  it('deve ser capaz de vizualizar todos os agendamentos do cliente, 5 por pagina', async () => {
    const response = await request(app).get('/admin_listar_agendamentos?page=1')
      .set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });
});