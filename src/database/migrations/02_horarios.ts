import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('horarios', table => {
    table.increments('id').primary();
    
    table.string('horario').notNullable();
  });
};

export async function down(knex: Knex) {
  return knex.schema.dropTable('horarios');
};