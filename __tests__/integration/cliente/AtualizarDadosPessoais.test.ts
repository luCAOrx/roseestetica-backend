import request from 'supertest';
import app from '../../../src/app';
import connection from '../../../src/database/connection';

describe('O cliente', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de atualizar seus dados pessoais', async () => {
    const authenticate = await request(app)
    .post('/login')
    .send({
      email: "rafaela@gmail.com",
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
    .put('/atualizar_dados_pessoais/1')
    .set('Authorization' ,`Bearer ${refreshToken}`)
    .send({
      nome: "Rafaela Santos",
      telefone: "8434345050",
      celular: "84955443323"
    });

    expect(response.status).toBe(201);
  });
});