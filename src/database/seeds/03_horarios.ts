import Knex from 'knex';

export async function seed(knex: Knex) {
  return knex('horarios').insert([
    { horario: '08:00' },
    { horario: '10:00' },
    { horario: '12:00' },
    { horario: '14:00' },
    { horario: '16:00' },
    { horario: '18:00' },
    { horario: '20:00' }
  ]);
};
