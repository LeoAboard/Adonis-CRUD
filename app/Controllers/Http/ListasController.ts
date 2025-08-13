import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CriarListaValidator from 'App/Validators/CriarListaValidator'
import Lista from 'App/Models/Lista'
import Database from '@ioc:Adonis/Lucid/Database'

export default class ListasController {

    public async create({ request, response, auth }: HttpContextContract){

        await auth.use('web').authenticate()
        const validator = await request.validate(CriarListaValidator)

        await Lista.create({
            id_usuario: auth.use('web').user?.id,
            mensagem: validator.mensagem,
            status: false
        })

        return response.created({ message: 'Sua mensagem foi enviada.' })        
    }

    public async exibir({ response, auth }: HttpContextContract){

        await auth.use('web').authenticate()
        const lista = await Lista.query().where('id_usuario', '=', `${auth.use('web').user?.id}`).select('id', 'mensagem', 'status')
        return response.ok(lista)
    }

    public async atualizar({ request, response, auth }: HttpContextContract){

        await auth.use('web').authenticate()
        const { id } = request.all()

        await Database.transaction(async () => {
            const lista = await Lista.query().where('id', id).andWhere('id_usuario', `${auth.use('web').user?.id}`).firstOrFail()
            lista.merge({ status: !lista.status })
            await lista.save()
            return response.ok({ message: `O status de sua tarefa foi alterado:\nMensagem: ${lista.mensagem}\nStatus: ${lista.status ? 'Concluído' : 'Pendente'}` })
        })
    }

    public async excluir({ request, response, auth }: HttpContextContract){

        await auth.use('web').authenticate()
        const { id } = request.all()
        await Lista.query().where('id', id).andWhere('id_usuario', `${auth.use('web').user?.id}`).delete().firstOrFail()
        return response.ok({ message: 'Task apagada com sucesso!' })
    }
}
