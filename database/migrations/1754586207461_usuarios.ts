import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'usuarios'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string("nome").notNullable()
      table.string("email").notNullable()
      table.string("senha").notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('data_cadastro', { useTz: true })
      table.timestamp('data_atualizacao', { useTz: true })
      table.boolean('ativo').defaultTo(1)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
