import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Lista extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public id_usuario: number

  @column()
  public mensagem: string

  @column()
  public status: boolean

  @column.dateTime({ autoCreate: true })
  public data_cadastro: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public data_atualizacao: DateTime
}
