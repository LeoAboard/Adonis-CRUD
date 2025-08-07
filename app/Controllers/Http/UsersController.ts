import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Usuario from 'App/Models/Usuario'

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

        return 'Este email ja foi cadastrado.'
    }

    public async login({ request }: HttpContextContract){
        const { email, senha } = request.all()

        const usuario = await Database.from('usuarios').select('id','nome', 'email', 'senha').where('email', '=', `${email}`).andWhere('senha', '=', `${senha}`)

        if(!usuario.length){
            return 'Email ou senha incorreto.'
        }

        //chamar auth aqui!!!
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

    public async atualizar({ request }: HttpContextContract){
        const { novoNome, novoEmail, novaSenha } = request.all()

        // if(novoNome){
        //     return 'Seu nome foi alterado.'
        // }
        // if(novoEmail){

        // }
        // if(novaSenha){

        // }

        const usuario = await Usuario.findOrFail(1)
        await usuario.merge({"nome": novoNome}).save()
        return 'foi'
    }

    public async excluir(){

    }
}
