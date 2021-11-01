import Knex from 'knex';

export async function seed(knex: Knex) {
  await knex('cidades').insert([
    { cidade: 'Natal' },
    { cidade: 'Alto do Rodrigues' },
    { cidade: 'Pendências' },
    { cidade: 'Assu' },
    { cidade: 'Angicos' }
  ]);
};
