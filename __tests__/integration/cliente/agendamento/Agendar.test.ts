import request from 'supertest';
import app from '../../../../src/app';
import connection from '../../../../src/database/connection';

describe('O cliente', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de se agendar', async () => {
    const authenticate = await request(app)
    .post('/login')
    .send({
      email: "rafaelaa@gmail.com",
      senha: "123456789"
    })
    .then(response => response.body.refreshToken.id);
    
    const refreshToken = await request(app)
    .post('/refresh_token')
    .send({
      refresh_token: authenticate
    })
    .then(response => response.body.token);

    const response = await request(app)
    .post('/agendar/1')
    .send({
      data: 20210724,
      procedimento_id: [1,2,3],
      horario_id: 1
    })
    .set('Authorization' ,`Bearer ${refreshToken}`);

    console.log(response.body);

    expect(response.status).toBe(201);
  });
});