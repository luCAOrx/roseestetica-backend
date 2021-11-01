import Knex from 'knex';

export async function seed(knex: Knex) {
  await knex('procedimentos').insert([
    { procedimento: 'Limpeza', preco: 'R$ 35,00' },
    { procedimento: 'Tratamento', preco: 'R$ 45,00' },
    { procedimento: 'Limpeza e Tratamento', preco: 'R$ 60,00' }
  ]);
};
