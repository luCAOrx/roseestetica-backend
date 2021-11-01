const request = require('supertest');
const app = require('../../../../../src/app');
const connection = require('../../../../../src/database/connection');
const jwt = require('jsonwebtoken');
const authConfig = require('../../../../../src/config/auth.json');

function gerarToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400
  });
}

describe('O admin', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de remarcar o agendamento do cliente', async () => {
    const response = await request(app)
      .put('/remarcar/10/11').set('Authorization' ,`Bearer ${gerarToken()}`)
      .send({ data: 20200725, horario_id: 3 });

      console.log(response.body);

      expect(response.status).toBe(201);
  });
});