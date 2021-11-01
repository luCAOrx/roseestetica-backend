import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('admins', table => {
    table.increments('id').primary();

    table.string('email', 80).notNullable().unique();
    table.string('senha', 50).notNullable();
    table.string('token_reset_senha', 20);
    table.timestamp('expiracao_reset_senha').defaultTo(knex.fn.now());
    table.timestamp('criado_em').defaultTo(knex.fn.now());
    table.timestamp('atualizado_em').defaultTo(knex.fn.now());
  });
};

export async function down(knex: Knex) {
  return knex.schema.dropTable('admins');
};
