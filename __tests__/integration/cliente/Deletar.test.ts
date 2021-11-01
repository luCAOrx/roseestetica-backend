import request from 'supertest';
import app from '../../../src/app';
import connection from '../../../src/database/connection';

describe('O cliente', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de deletar sua conta', async () => {
    const authenticate = await request(app)
    .post('/login')
    .send({
      email: "rafa@gmail.com",
      senha: "12345678"
    })
    .then(response => response.body.refreshToken.id);
    
    const refreshToken = await request(app)
    .post('/refresh_token')
    .send({
      refresh_token: authenticate
    })
    .then(response => response.body.token);

    const response = await request(app)
    .delete('/deletar/2')
    .set('Authorization' ,`Bearer ${refreshToken}`);

    expect(response.status).toBe(204);
  });
});