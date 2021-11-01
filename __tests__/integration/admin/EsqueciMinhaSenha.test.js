const request = require('supertest');
const app = require('../../../src/app');
const connection = require('../../../src/database/connection');

describe('O admin', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve enviar um e-mail para receber um token e recuperar sua senha', async () => {
    const response = await request(app)
      .post('/admin_esqueci_minha_senha')
      .send({ email: "lucaorx@gmail.com" });

      console.log(response.body);

      expect(response.status).toBe(200);
  });
});