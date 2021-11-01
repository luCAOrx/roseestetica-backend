import request from 'supertest';

import app from '../../../src/app';

import connection from '../../../src/database/connection';

describe('O cliente', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de atualizar seus dados de endereço', async () => {
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
    .put('/atualizar_endereco/1')
    .set('Authorization' ,`Bearer ${refreshToken}`)
    .send({
      cidade_id: 2,
      bairro: "Candelária",
      logradouro: "Av das bandeiras",
      numero: "145",
      complemento: "Bloco Moinhos de Vento, Apt 120",
      cep: "48123769"
    });
      
    expect(response.status).toBe(201);
  });
});