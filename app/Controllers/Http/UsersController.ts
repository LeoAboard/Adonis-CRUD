import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CriarUsuarioValidator from 'App/Validators/CriarUsuarioValidator'
import AtualizarUsuarioValidator from 'App/Validators/AtualizarUsuarioValidator'
import Hash from '@ioc:Adonis/Core/Hash'
import Usuario from 'App/Models/Usuario'
import jwt from 'jsonwebtoken'

export default class UsersController {

    public async create({ request, response }:  HttpContextContract){

        try{
            const dadosUsuario = await request.validate(CriarUsuarioValidator)

            await Usuario.create({
                nome: dadosUsuario.nome,
                email: dadosUsuario.email,
                senha: dadosUsuario.senha
            })

            return 'Usuario criado com sucesso.'
        } catch(error:any){
            
            return response.badRequest(error.CustomMessages)
        }
    }

    public async login({ request, response }: HttpContextContract){
        const { email, senha } = request.all()

        const usuario = await Usuario.query().select('id','nome', 'email', 'senha', 'ativo').where('email', '=', `${email}`)
        
        if(await Hash.verify(usuario[0].senha, senha)){

            const token = jwt.sign(
                {id: usuario[0].id},
                '123',
                {expiresIn: '5d'}
            ) 

            response.cookie('token', token, {
                httpOnly: true,
                sameSite: true,
                maxAge: 5*24*60*60*1000
            })

            if(usuario[0].ativo == false){
                await Usuario.query().where('email', '=', `${email}`).update({'ativo': 1})
                return `Bem vindo de volta ${usuario[0].nome}!`
            }

            return `Bem vindo ${usuario[0].nome}!`
        }
    
        return 'Email ou senha incorreto'
    }

    public async exibir({ request }: HttpContextContract){
        const { nome }  = request.all()

        const usuario = await Usuario.findBy('nome', nome)

        if(!usuario){
            return 'Usuário não existe.'
        }

        return `Nome: ${usuario.nome}\nEmail: ${usuario.email}`
    }

    public async atualizar({ request, payload }: HttpContextContract){
        const dadosUsuario = await request.validate(AtualizarUsuarioValidator)

        if(dadosUsuario.nome){
            await Usuario.query().where('id', '=', `${payload}`).update({'nome': dadosUsuario.nome})
            return 'Seu nome foi alterado com sucesso.'
        }
        if(dadosUsuario.email){
            await Usuario.query().where('id', '=', `${payload}`).update({'email': dadosUsuario.email})
            return 'Seu email foi alterado com sucesso.'
        }
        if(dadosUsuario.senha){
            await Usuario.query().where('id', '=', `${payload}`).update({'senha': await Hash.make(dadosUsuario.senha)})
            return 'Sua senha foi alterada com sucesso.'
        }

        return 'Erro: envie um dado para atualizar.'
    }

    public async excluir({ response, payload }: HttpContextContract){

        response.clearCookie('token')
        await Usuario.query().where('id', '=', `${payload}`).update({'ativo': 0})
        return 'Sua conta foi excluída com sucesso.'
    }
}
