const request = require('supertest');
const app = require('../../../src/app');
const connection = require('../../../src/database/connection');

describe('O admin', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de se autenticar se as credencias forem validas', async () => {
    const response = await request(app).post('/admin_login')
    .send({ email: "lucaorx@gmail.com", senha: "lucao" });

    console.log(response.body);

    expect(response.status).toBe(200);
  });
});