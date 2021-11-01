const request = require('supertest');
const app = require('../../../src/app');
const connection = require('../../../src/database/connection');

describe('O admin', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de se cadastrar', async () => {
    const response = await request(app)
      .post('/admin_cadastro').send({ email: "rose@gmail.com", senha: "rose123" });

      console.log(response.body);

      expect(response.status).toBe(201);
  });

  it('deve ser capaz de se autenticar depois de se cadastrar', async () => {
    const response = await request(app).post('/admin_login')
    .send({ email: "rose@gmail.com", senha: "rose123" });

    console.log(response.body);

    expect(response.status).toBe(200);
  });
});