import Knex from 'knex';

export async function seed(knex: Knex) {
  await knex('sexos').insert([
    { sexo: 'Masculino' },
    { sexo: 'Feminino' },
  ]);
};
