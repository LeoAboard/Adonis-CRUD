import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CriarListaValidator from 'App/Validators/CriarListaValidator'
import Lista from 'App/Models/Lista'

export default class ListasController {

    public async create({ request, response, auth }: HttpContextContract){

        try{
            await auth.use('web').authenticate()
            const validator = await request.validate(CriarListaValidator)

            await Lista.create({
                id_usuario: auth.use('web').user?.id,
                mensagem: validator.mensagem,
                status: false
            })

            return response.created({message: 'Sua mensagem foi enviada.'})

        }catch(error:any){
            return response.unauthorized(error)
        }
    }

    public async exibir({ response, auth }: HttpContextContract){

        await auth.use('web').authenticate()
        const lista = await Lista.query().where('id_usuario', '=', `${auth.use('web').user?.id}`).select('id', 'mensagem', 'status')
        return response.ok(lista)
    }

    public async atualizar({ request, response, auth }: HttpContextContract){

        await auth.use('web').authenticate()

        const { id } = request.all()

        try{
            const lista = await Lista.query().where('id', id).andWhere('id_usuario', `${auth.use('web').user?.id}`).firstOrFail()
            lista.merge({ status: !lista.status })
            await lista.save()
            return response.ok({message: `O status de sua tarefa foi alterado:\nMensagem: ${lista.mensagem}\nStatus: ${lista.status ? 'Concluído' : 'Pendente'}`})

        }catch(error:any){
            return response.unauthorized({message: 'Você não pode alterar essa task.'})
        }
    }

    public async excluir({ request, response, auth }: HttpContextContract){

        await auth.use('web').authenticate()
        const { id } = request.all()

        try{
            await Lista.query().where('id', id).andWhere('id_usuario', `${auth.use('web').user?.id}`).delete().firstOrFail()
            return response.ok({message: 'Task apagada com sucesso!'})
            
        }catch(error:any){
            return response.unauthorized({message: 'Você não pode apagar essa task.'})
        }
    }
}
