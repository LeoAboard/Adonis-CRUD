import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
//import HttpContext from '@ioc:Adonis/Core/HttpContext'
//import { http } from 'Config/app'
import jwt from 'jsonwebtoken'

export default class Auth {

  public async handle(ctx: HttpContextContract, next: () => Promise<void>): Promise<void> {
    const { request, response } = ctx
    // code for middleware goes here. ABOVE THE NEXT CALL

    const token = request.cookie('token')

    if(!token){
      return response.unauthorized({message: 'Faça login para continuar.'})
    }

    const payload = jwt.verify(token, '123')
    
    ctx.payload = payload.id

    await next()
  }
}
