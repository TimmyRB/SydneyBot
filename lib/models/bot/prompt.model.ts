import { MessageEmbed, TextChannel, Message } from 'discord.js'
import { Database } from '../../database/database';

export default class Prompt {
    id: string;
    page: number;
    totalPages: number;
    content: MessageEmbed[];

    constructor(content: MessageEmbed[], id?: string, page?: number, totalPages?: number) {
        if (id)
            this.id = id
        else
            this.id = '0'

        if (page)
            this.page = page
        else
            this.page = 0

        if (totalPages)
            this.totalPages = totalPages
        else
            this.totalPages = 1

        this.content = content
    }

    show(channel: TextChannel) {
        channel.send(this.content[0]).then(message => {
            Database.createPrompt(message.id, this.content)

            if (this.content.length > 1) {
                message.react('◀').then(() => message.react('▶'))
            }
        })
    }

    nextPage(message: Message) {
        if (this.id === '0')
            return

        if (message.id !== this.id)
            return

        if (this.page + 1 > this.totalPages)
            return

        this.page++;
        message.edit(this.content[this.page])
        Database.nextPage(this.id)
    }

    previousPage(message: Message) {
        if (this.id === '0')
            return

        if (message.id !== this.id)
            return

        if (this.page - 1 < 0)
            return

        this.page--;
        message.edit(this.content[this.page])
        Database.previousPage(this.id)
    }
}
