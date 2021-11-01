import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('refresh_token', table => {
    table.string('id').primary();

    table.integer('espira_em').notNullable();
    table.integer('cliente_id').unsigned().notNullable();

    table.foreign('cliente_id')
    .references('id')
    .inTable('clientes')
    .onDelete('CASCADE');
  });
};

export async function down(knex: Knex) {
  return knex.schema.dropTable('refresh_token');
};