import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('agendamentos_procedimentos', table => {
    table.increments('id').primary();

    table.integer('agendamento_id').unsigned().notNullable();

    table.integer('procedimento_id').unsigned().notNullable();

    table.timestamp('procedimento_alterado_em').nullable().defaultTo(null);

    table.foreign('agendamento_id')
      .references('id')
      .inTable('agendamentos')
      .onDelete('CASCADE');

    table.foreign('procedimento_id')
      .references('id')
      .inTable('procedimentos');
  });
};

export async function down(knex: Knex) {
  return knex.schema.dropTable('agendamentos_procedimentos');
};
