const request = require('supertest');
const app = require('../../../src/app');
const connection = require('../../../src/database/connection');

describe('O admin', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve inserir o token que foi enviado para seu e-mail para recuperar sua senha', async () => {
    const response = await request(app)
      .put('/admin_atualizar_senha')
      .send({ 
        "email": "lucaorx@gmail.com",
        "token": "0c676730a3afbe29344f9e151ab9b7fbf334c039",
        "senha": "lucao"
      });

      console.log(response.body);

      expect(response.status).toBe(201);
  });
});