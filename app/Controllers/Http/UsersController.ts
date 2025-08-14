import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CriarUsuarioValidator from 'App/Validators/CriarUsuarioValidator'
import AtualizarUsuarioValidator from 'App/Validators/AtualizarUsuarioValidator'
import Hash from '@ioc:Adonis/Core/Hash'
import Usuario from 'App/Models/Usuario'
import Database from '@ioc:Adonis/Lucid/Database'
import { Exception } from '@adonisjs/core/build/standalone'


export default class UsersController {

    public async create({ request, response }:  HttpContextContract){

        const dadosUsuario = await request.validate(CriarUsuarioValidator)

        await Usuario.create({
            nome: dadosUsuario.nome,
            email: dadosUsuario.email,
            senha: dadosUsuario.senha
        })

        return response.created({ message: 'Usuario criado com sucesso.' })    
    }

    public async login({ request, response, auth }: HttpContextContract){

        const { email, senha } = request.all()

        await Database.transaction(async () => {

            const usuario = await Usuario.findBy('email', email)

            if(!usuario) throw new Exception('', 403)
            
            if(!(await Hash.verify(usuario.senha, senha))) throw new Exception('', 403)
        
            if(usuario.ativo == false){
                usuario.merge({'ativo': true});
                usuario.save()
            }

            let token = await auth.use('api').login(usuario, {expiresIn: '1d'})
            return response.ok({ message: `Bem vindo ${usuario.nome}!`, token})
        })
            
    }

    public async exibir({ request, response }: HttpContextContract){

        const { nome }  = request.all()
        const usuario = await Usuario.query().select('nome', 'email').where('nome', 'LIKE', `${nome}%`)

        if(!usuario.length) throw new Exception('', 404);

        return response.ok(usuario)
    }

    public async atualizar({ request, response, auth }: HttpContextContract){

        await auth.use('api').authenticate()

        const dadosUsuario = await request.validate(AtualizarUsuarioValidator)

        if(dadosUsuario.nome){
            await Usuario.query().where('id', '=', `${auth.use('api').user?.id}`).update({'nome': dadosUsuario.nome})
            return response.ok({ message: 'Seu nome foi alterado com sucesso.' })
        }
        if(dadosUsuario.email){
            await Usuario.query().where('id', '=', `${auth.use('api').user?.id}`).update({'email': dadosUsuario.email})
            return response.ok({ message: 'Seu email foi alterado com sucesso.' })
        }
        if(dadosUsuario.senha){
            await Usuario.query().where('id', '=', `${auth.use('api').user?.id}`).update({'senha': await Hash.make(dadosUsuario.senha)})
            return response.ok({ message: 'Sua senha foi alterada com sucesso.' })
        }

        throw new Exception('', 401)
    }

    public async excluir({ response, auth }: HttpContextContract){

        await auth.use('api').authenticate()
        await Usuario.query().where('id', '=', `${auth.use('api').user?.id}`).update({'ativo': 0})
        await auth.use('api').logout()
        return response.ok({ message: 'Sua conta foi excluída com sucesso.' })
    }
}
