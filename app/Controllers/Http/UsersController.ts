import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Usuario from 'App/Models/Usuario'
import jwt from 'jsonwebtoken'

export default class UsersController {

    public async create({ request }:  HttpContextContract){
        const { nome, email, senha } = request.all()

        const existEmail = await Usuario.findBy('email', email)

        if(!existEmail){
            await Usuario.create({
                nome,
                email,
                senha
            })

            return 'Usuário cadastrado com sucesso.'
        }

        return 'Este email já está em uso.'
    }

    public async login({ request, response }: HttpContextContract){
        const { email, senha } = request.all()

        const usuario = await Database.from('usuarios').select('id','nome', 'email', 'senha', 'ativo').where('email', '=', `${email}`).andWhere('senha', '=', `${senha}`)

        if(!usuario.length){
            return 'Email ou senha incorreto.'
        }

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

        if(usuario[0].ativo == 0){
            await Database.from('usuarios').where('email', '=', `${email}`).update({'ativo': 1})
            return `Bem vindo de volta ${usuario[0].nome}!`
        }

        return `Bem vindo ${usuario[0].nome}!`
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
        const { novoNome, novoEmail, novaSenha } = request.all()

        if(novoNome){
            await Database.from('usuarios').where('id', '=', `${payload}`).update({'nome': novoNome})
            return 'Seu nome foi alterado com sucesso.'
        }
        if(novoEmail){

            const existEmail = await Usuario.findBy('email', novoEmail)
            if(existEmail){
                return 'Este email já está em uso.'
            }

            await Database.from('usuarios').where('id', '=', `${payload}`).update({'email': novoEmail})
            return 'Seu email foi alterado com sucesso.'
        }
        if(novaSenha){
            await Database.from('usuarios').where('id', '=', `${payload}`).update({'senha': novaSenha})
            return 'Sua senha foi alterada com sucesso.'
        }

        return 'Erro: envie um dado para atualizar.'
    }

    public async excluir({ response, payload }: HttpContextContract){

        response.clearCookie('token')
        await Database.from('usuarios').where('id', '=', `${payload}`).update({'ativo': 0})
        return 'Sua conta foi excluída com sucesso.'
    }
}
