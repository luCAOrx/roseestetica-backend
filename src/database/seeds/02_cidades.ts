import Knex from 'knex';

export async function seed(knex: Knex) {
  await knex('cidades').insert([
    { cidade: 'Natal' },
    { cidade: 'Alto do Rodrigues' },
    { cidade: 'PendĂȘncias' },
    { cidade: 'Assu' },
    { cidade: 'Angicos' },
  ]);
}
