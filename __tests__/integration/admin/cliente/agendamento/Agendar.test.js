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

  it('deve ser capaz de agendar um cliente', async () => {
    const response = await request(app)
      .post('/admin_agendar/12')
      .send({
        data: 20200725,
        procedimento_id: 1,
        horario_id: 2
      })
      .set('Authorization' ,`Bearer ${gerarToken()}`);

      console.log(response.body);

      expect(response.status).toBe(201);
  });
});