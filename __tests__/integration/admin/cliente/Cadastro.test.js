const request = require('supertest');
const app = require('../../../../src/app');
const connection = require('../../../../src/database/connection');
const faker = require('faker/locale/pt_BR');

describe('O admin', () => {
  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de cadastrar um novo cliente', async () => {
    const response = await request(app)
      .post('/cadastro')
      .send({
        nome: faker.name.findName(),
        cpf: "30070060022",
        sexo_id: 1,
        telefone: "8434345050",
        celular: "84955443323",
        cidade_id: 2,
        bairro: "Capim macio",
        logradouro: "Rua amarelinha",
        numero: "66",
        complemento: "Bloco A, Apt 40",
        cep: "24456345",
        email: faker.internet.email(),
        senha: faker.internet.password()
      });

      console.log(response.body);

      expect(response.status).toBe(201);
  });
});