import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Lista from 'App/Models/Lista'

export default class ListasController {

    public async create({ request, payload }: HttpContextContract){
        const { mensagem } = request.all()

        try{
            await Lista.create({
                id_usuario: payload,
                mensagem,
                status: false
            })

            return `Sua mensagem foi enviada: ${mensagem}`

        } catch(error:any){
            return 'Escreva uma mensagem.'
        }
    }

    public async exibir({ payload }: HttpContextContract){
        const lista = await Lista.query().where('id_usuario', '=', `${payload}`).select('id', 'mensagem', 'status')

        return lista
    }

    public async atualizar({ request, payload }: HttpContextContract){
        const { id } = request.all()

        try{
            const lista = await Lista.query().where('id', id).andWhere('id_usuario', payload).firstOrFail()

            lista.merge({ status: !lista.status })
            await lista.save()
            return `O status de sua tarefa foi alterado:\nMensagem: ${lista.mensagem}\nStatus: ${lista.status ? 'Concluído' : 'Pendente'}`

        } catch(error:any){
            return 'Você não pode alterar essa task.'
        }
    }

    public async excluir({ request, payload }: HttpContextContract){
        const { id } = request.all()

        try{
            const lista = await Lista.query().where('id', id).andWhere('id_usuario', payload).delete()
            if(!lista[0]) throw console.error();
            return 'Task apagada com sucesso!'
        } catch(error:any){
            return 'Você não pode apagar essa task.'
        }
    }
}
