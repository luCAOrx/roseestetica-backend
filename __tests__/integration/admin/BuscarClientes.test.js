const request = require('supertest');
const app = require('../../../src/app');
const connection = require('../../../src/database/connection');
const jwt = require('jsonwebtoken');
const authConfig = require('../../../src/config/auth.json');

function gerarToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400
  });
}

describe('O admin', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de buscar clientes pelo nome, 5 por pagina', async () => {
    const response = await request(app)
      .get('/admin_buscar_clientes?page=1&nome=m').set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar clientes pelo cpf, 5 por pagina', async () => {
    const response = await request(app)
      .get('/admin_buscar_clientes?page=1&cpf=30070060021').set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar clientes pelo sexo, 5 por pagina', async () => {
    const response = await request(app)
      .get('/admin_buscar_clientes?page=1&sexo=masc').set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar clientes pelo telefone, 5 por pagina', async () => {
    const response = await request(app)
      .get('/admin_buscar_clientes?page=1&telefone=22').set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar clientes pelo celular, 5 por pagina', async () => {
    const response = await request(app)
      .get('/admin_buscar_clientes?page=1&celular=90').set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar clientes pelo cidade, 5 por pagina', async () => {
    const response = await request(app)
      .get('/admin_buscar_clientes?page=1&cidade=alto').set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar clientes pelo bairro, 5 por pagina', async () => {
    const response = await request(app)
      .get('/admin_buscar_clientes?page=1&bairro=candelária').set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar clientes pelo logradouro, 5 por pagina', async () => {
    const response = await request(app)
      .get('/admin_buscar_clientes?page=1&logradouro=bandeiras').set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar clientes pelo numero, 5 por pagina', async () => {
    const response = await request(app)
      .get('/admin_buscar_clientes?page=1&numero=145').set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar clientes pelo complemento, 5 por pagina', async () => {
    const response = await request(app)
      .get('/admin_buscar_clientes?page=1&complemento=moinhos').set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar clientes pelo cep, 5 por pagina', async () => {
    const response = await request(app)
      .get('/admin_buscar_clientes?page=1&cep=69').set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });

  it('deve ser capaz de buscar clientes pelo e-mail, 5 por pagina', async () => {
    const response = await request(app)
      .get('/admin_buscar_clientes?page=1&email=eduardo').set('Authorization' ,`Bearer ${gerarToken()}`)

      console.log(response.body);

      expect(response.status).toBe(200);
  });
});