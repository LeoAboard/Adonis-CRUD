import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CriarUsuarioValidator from 'App/Validators/CriarUsuarioValidator'
import AtualizarUsuarioValidator from 'App/Validators/AtualizarUsuarioValidator'
import Hash from '@ioc:Adonis/Core/Hash'
import Usuario from 'App/Models/Usuario'

export default class UsersController {

    public async create({ request, response }:  HttpContextContract){

        try{
            const dadosUsuario = await request.validate(CriarUsuarioValidator)

            await Usuario.create({
                nome: dadosUsuario.nome,
                email: dadosUsuario.email,
                senha: dadosUsuario.senha
            })

            return response.created({message: 'Usuario criado com sucesso.'})
        } catch(error:any){
            
            return response.conflict(error)
        }
    }

    public async login({ request, response, auth }: HttpContextContract){

        try{
            const { email, senha } = request.all()
            const usuario = await Usuario.query().select('id','nome', 'email', 'senha', 'ativo').where('email', '=', `${email}`).firstOrFail()
                
            if(!(await Hash.verify(usuario.senha, senha))) throw console.error();
            
            if(usuario.ativo == false) await Usuario.query().where('email', '=', `${email}`).update({'ativo': 1});

            await auth.use('web').login(usuario)
            return response.ok({message: `Bem vindo ${usuario.nome}!`})
            
        }catch{
            response.unauthorized({message: 'Email ou senha incorretos.'})
        }
    }

    public async exibir({ request, response }: HttpContextContract){

        const { nome }  = request.all()
        const usuario = await Usuario.query().select('nome', 'email').where('nome', '=', nome)

        if(!usuario) return response.notFound({message: 'Usuário não existe.'});

        return response.ok(usuario)
    }

    public async atualizar({ request, response, auth}: HttpContextContract){

        await auth.use('web').authenticate()
        const dadosUsuario = await request.validate(AtualizarUsuarioValidator)

        if(dadosUsuario.nome){
            await Usuario.query().where('id', '=', `${auth.use('web').user?.id}`).update({'nome': dadosUsuario.nome})
            return response.ok({message: 'Seu nome foi alterado com sucesso.'})
        }
        if(dadosUsuario.email){
            await Usuario.query().where('id', '=', `${auth.use('web').user?.id}`).update({'email': dadosUsuario.email})
            return response.ok({message: 'Seu email foi alterado com sucesso.'})
        }
        if(dadosUsuario.senha){
            await Usuario.query().where('id', '=', `${auth.use('web').user?.id}`).update({'senha': await Hash.make(dadosUsuario.senha)})
            return response.ok({message: 'Sua senha foi alterada com sucesso.'})
        }

        return response.badRequest({message: 'Erro: envie um dado para atualizar.'})
    }

    public async excluir({ response, auth }: HttpContextContract){

        try{
            await auth.use('web').authenticate()
            await Usuario.query().where('id', '=', `${auth.use('web').user?.id}`).update({'ativo': 0})
            await auth.use('web').logout()
            return response.ok({message: 'Sua conta foi excluída com sucesso.'})
            
        }catch(error){
            response.unauthorized({message: 'Faça Login para continuar.'})
        }
    }
}
