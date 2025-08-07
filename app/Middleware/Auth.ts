import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
//import jwt from 'jsonwebtoken'

export default class Auth {

  public async handle({}: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    

    await next()
  }
}
