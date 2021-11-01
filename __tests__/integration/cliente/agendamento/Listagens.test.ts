import request from 'supertest';
import app from '../../../../src/app';
import connection from '../../../../src/database/connection';

describe('O cliente', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de vizualizar horários disponíveis', async () => {
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
      .get('/agendamentos_disponiveis?data=202107')
      .set('Authorization' ,`Bearer ${refreshToken}`);

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de vizualizar seu histórico de agendamentos', async () => {
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
    .get('/meus_agendamentos/1?page=1')
    .set('Authorization' ,`Bearer ${refreshToken}`);

    console.log(response.body.erro);

    expect(response.status).toBe(200);
  });

  it('deve ser capaz de vizualizar detalhes do agendamentos', async () => {
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
    .get('/detalhes_do_agendamento/1/1')
    .set('Authorization' ,`Bearer ${refreshToken}`);

    console.log(response.body);

    expect(response.status).toBe(200);
  });
});