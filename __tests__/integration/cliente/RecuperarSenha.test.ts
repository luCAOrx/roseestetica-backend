import request from 'supertest';
import app from '../../../src/app';
import connection from '../../../src/database/connection';

describe('O cliente', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de inserir o código que foi enviado para seu e-mail', async () => {
    const response = await request(app)
      .put('/atualizar_senha')
      .send({ 
        email: "rafaelaa@gmail.com",
        token: "0ee617b9436d2e368bf325be5fbdc9c0b8e38517",
        senha: "123456789"
      });

      expect(response.status).toBe(201);
  });
});