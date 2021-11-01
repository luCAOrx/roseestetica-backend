import request from 'supertest';
import app from '../../../src/app';
import connection from '../../../src/database/connection';

describe('O cliente', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de enviar um e-mail para receber o código.', async () => {
    const response = await request(app)
      .post('/esqueci_minha_senha')
      .send({ 
        email: "rafaelaa@gmail.com" 
      });

      expect(response.status).toBe(200);
  });
});