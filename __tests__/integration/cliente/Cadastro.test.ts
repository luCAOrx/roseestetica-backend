import request from 'supertest';
import app from '../../../src/app';
import connection from '../../../src/database/connection';
import path from  'path';

describe('O cliente', () => {
  // beforeAll(async () => {
  //   await connection.migrate.rollback();
  //   await connection.migrate.latest();
  //   await connection.seed.run();
  // });

  afterAll(async () => {
    await connection.destroy();
  });

  it('deve ser capaz de se cadastrar', async () => {
    const imagem = path.resolve(__dirname, '..', '..', '..', '..', '..', '..', '..', '..', 'Imagens', 'minhas_fotos', '54279170_2281425602145302_3605701289251438592_n.jpg');

    const response = await request(app)
    .post('/cadastro')
    .field('nome', 'Rafaela Silva')
    .field('cpf', '30070060001')
    .field('sexo_id', 2)
    .field('telefone', '8434345050')
    .field('celular', '84955443323')
    .field('cidade_id', 1)
    .field('bairro', 'Capim macio')
    .field('logradouro', 'Rua amarelinha')
    .field('numero', '66')
    .field('complemento', 'Bloco A, Apt 40')
    .field('cep', '20030040')
    .field('email', 'rafa@gmail.com')
    .field('senha', '12345678')
    .field('imagem_aws_url', 'a')
    .attach('foto', imagem)

    expect(response.status).toBe(201);
  });
});