/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {

  protected statusPages = {
    '404': 'errors/not-found',
    '500..599': 'errors/server-error'
  }

  constructor () {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract){

      if(error.status === 400){
        return ctx.response.status(400).send({ message: 'Envio Inválido' })
      }

      if(error.status === 404){
        return ctx.response.status(404).send({ message: 'Não encontrado.' })
      }

      if (error.status === 422){
        return ctx.response.status(422).send(error.messages)
      }

      if(error.code === 'E_ROW_NOT_FOUND' || error.status === 403){
        return ctx.response.status(403).send({ message: 'Email ou senha incorretos.'})
      }

      if(error.status === 401){
        return ctx.response.status(401).send({ message: 'Faça login para continuar' })
      }

      return ctx.response.status(500).send('Erro interno')
  }
}
