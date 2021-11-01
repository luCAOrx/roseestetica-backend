import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('procedimentos', table => {
    table.increments('id').primary();
    
    table.string('procedimento').notNullable();
    table.string('preco').notNullable();
  });  
};

export async function down(knex: Knex) {
  return knex.schema.dropTable('procedimentos');
};