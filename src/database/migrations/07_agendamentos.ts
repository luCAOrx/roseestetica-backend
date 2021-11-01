import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('agendamentos', table => {
    table.increments('id').primary();

    table.date('data').notNullable();
    table.string('situacao').notNullable();
    table.timestamp('agendado_em').nullable().defaultTo(null);
    table.timestamp('remarcado_em').nullable().defaultTo(null);

    table.integer('horario_id').unsigned().notNullable();
    table.integer('cliente_id').unsigned().notNullable();

    table.foreign('horario_id')
      .references('id')
      .inTable('horarios');
      
    table.foreign('cliente_id')
      .references('id')
      .inTable('clientes')
      .onDelete('CASCADE');
  });
};

export async function down(knex: Knex) {
  return knex.schema.dropTable('agendamentos');
};
